import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { FulfillmentStatus, PaymentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
    }

    // Find the parent order by paystack reference
    const order = await prisma.parentOrder.findUnique({
      where: { paystackReference: reference },
      include: {
        sellerOrders: {
          include: { shop: { select: { name: true } }, items: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found for this reference' }, { status: 404 });
    }

    // Idempotency check: If already paid, return success immediately
    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      });
    }

    // Verify transaction with Paystack server
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status && verification.data && verification.data.status === 'success') {
      const payData = verification.data;

      // Atomically update order to PAID and confirm seller suborders
      await prisma.$transaction(async (tx) => {
        await tx.parentOrder.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(payData.paid_at || Date.now()),
          },
        });

        // Update all seller suborders to CONFIRMED
        await tx.sellerOrder.updateMany({
          where: { parentOrderId: order.id },
          data: { status: FulfillmentStatus.CONFIRMED },
        });

        // Record the verified PaymentTransaction
        await tx.paymentTransaction.upsert({
          where: { reference },
          update: {
            status: 'success',
            paidAt: new Date(payData.paid_at || Date.now()),
            gatewayResponse: payData.gateway_response || 'Approved',
          },
          create: {
            parentOrderId: order.id,
            provider: 'PAYSTACK',
            reference,
            amount: Number(order.totalAmount),
            currency: 'GHS',
            channel: payData.channel || 'mobile_money',
            status: 'success',
            gatewayResponse: payData.gateway_response || 'Approved',
            paidAt: new Date(payData.paid_at || Date.now()),
            rawResponse: payData as any,
          },
        });
      });

      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      });
    } else {
      // Payment failed or incomplete
      await prisma.parentOrder.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });

      return NextResponse.json({
        success: false,
        error: verification.message || 'Payment verification failed',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Internal verification error' }, { status: 500 });
  }
}
