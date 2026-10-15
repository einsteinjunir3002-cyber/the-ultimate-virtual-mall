import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaystackWebhookSignature } from '@/lib/paystack';
import { FulfillmentStatus, PaymentStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook authenticity
    const isAuthentic = verifyPaystackWebhookSignature(rawBody, signature);
    if (!isAuthentic) {
      console.warn('Paystack webhook signature verification failed.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const data = event.data;
      const reference = data.reference;

      const order = await prisma.parentOrder.findUnique({
        where: { paystackReference: reference },
      });

      if (!order) {
        return NextResponse.json({ message: 'Order reference not found' }, { status: 200 });
      }

      // Idempotency: skip if already marked as paid
      if (order.paymentStatus === PaymentStatus.PAID) {
        return NextResponse.json({ message: 'Order already fulfilled' }, { status: 200 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.parentOrder.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(data.paid_at || Date.now()),
          },
        });

        await tx.sellerOrder.updateMany({
          where: { parentOrderId: order.id },
          data: { status: FulfillmentStatus.CONFIRMED },
        });

        await tx.paymentTransaction.upsert({
          where: { reference },
          update: {
            status: 'success',
            paidAt: new Date(data.paid_at || Date.now()),
            gatewayResponse: data.gateway_response || 'Approved',
          },
          create: {
            parentOrderId: order.id,
            provider: 'PAYSTACK',
            reference,
            amount: Number(order.totalAmount),
            currency: 'GHS',
            channel: data.channel || 'mobile_money',
            status: 'success',
            gatewayResponse: data.gateway_response || 'Approved',
            paidAt: new Date(data.paid_at || Date.now()),
            rawResponse: data,
          },
        });
      });

      console.log(`✓ Webhook successfully processed order ${order.orderNumber}`);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
