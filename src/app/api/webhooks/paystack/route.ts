import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaystackWebhookSignature } from '@/lib/paystack';
import { releaseOrderStock, settleOrderPayment } from '@/lib/orders';

/**
 * Paystack webhook. Authenticity = HMAC-SHA512 of the RAW body with our secret key.
 * Processing is idempotent (shared settleOrderPayment) so retried/duplicate
 * deliveries never double-pay, double-confirm or double-restock.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (!verifyPaystackWebhookSignature(rawBody, req.headers.get('x-paystack-signature'))) {
      console.warn('[webhook] Paystack signature verification failed');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as { event?: string; data?: Record<string, any> };
    const data = event.data ?? {};
    const reference = typeof data.reference === 'string' ? data.reference : null;
    if (!reference) return NextResponse.json({ status: 'ignored' }, { status: 200 });

    const order = await prisma.parentOrder.findUnique({ where: { paystackReference: reference } });
    if (!order) return NextResponse.json({ message: 'Order reference not found' }, { status: 200 });

    if (event.event === 'charge.success') {
      const result = await settleOrderPayment(order.id, {
        reference,
        status: String(data.status ?? 'success'),
        amountPesewas: Number(data.amount),
        currency: String(data.currency ?? ''),
        channel: data.channel ?? null,
        paidAt: data.paid_at ?? null,
        gatewayResponse: data.gateway_response ?? null,
        raw: data,
      });
      // amount mismatches return 200 so Paystack stops retrying; they are logged + recorded for review
      return NextResponse.json({ status: result }, { status: 200 });
    }

    if (event.event === 'charge.failed') {
      await releaseOrderStock(order.id, 'FAILED');
    }
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('[webhook] processing error', error);
    // 500 makes Paystack retry later
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
