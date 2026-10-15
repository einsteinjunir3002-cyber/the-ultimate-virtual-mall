import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { releaseOrderStock, settleOrderPayment } from '@/lib/orders';
import { apiError } from '@/lib/http';
import { clientIp, hit } from '@/lib/rate-limit';

/**
 * Browser return URL handler. The redirect itself proves nothing: we ask Paystack
 * directly for the transaction status and reconcile amount + currency before an
 * order is ever marked PAID.
 */
export async function GET(req: NextRequest) {
  try {
    const rl = hit(`verify:${clientIp(req)}`, 60, 10 * 60_000);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } });

    const reference = req.nextUrl.searchParams.get('reference');
    if (!reference || reference.length > 100) {
      return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
    }

    const order = await prisma.parentOrder.findUnique({ where: { paystackReference: reference } });
    if (!order) return NextResponse.json({ error: 'Order not found for this reference' }, { status: 404 });

    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({ success: true, alreadyProcessed: true, orderNumber: order.orderNumber, totalAmount: order.totalAmount });
    }

    const v = await verifyPaystackTransaction(reference);
    if (!v.status || !v.data) {
      // Provider unreachable / not configured: do NOT change the order state
      return NextResponse.json({ success: false, error: v.message || 'Payment could not be verified yet' }, { status: 502 });
    }

    const result = await settleOrderPayment(order.id, {
      reference,
      status: v.data.status,
      amountPesewas: v.data.amount,
      currency: v.data.currency,
      channel: v.data.channel,
      paidAt: v.data.paid_at,
      gatewayResponse: v.data.gateway_response,
      raw: v.data,
    });

    if (result === 'paid' || result === 'already_paid' || result === 'paid_needs_attention') {
      return NextResponse.json({ success: true, orderNumber: order.orderNumber, totalAmount: order.totalAmount, needsAttention: result === 'paid_needs_attention' });
    }
    if (result === 'amount_mismatch') {
      return NextResponse.json({ success: false, error: 'Payment amount did not match the order. Please contact support with your order number.' }, { status: 409 });
    }

    // Not successful: only a definitive failure releases the stock; still-pending payments are left alone
    if (['failed', 'reversed'].includes(v.data.status)) {
      await releaseOrderStock(order.id, 'FAILED');
      return NextResponse.json({ success: false, error: v.data.gateway_response || 'Payment failed' }, { status: 400 });
    }
    return NextResponse.json({ success: false, pending: true, error: 'Payment is still being processed. Please check again shortly.' }, { status: 202 });
  } catch (error) {
    return apiError(error, 'payments/verify');
  }
}
