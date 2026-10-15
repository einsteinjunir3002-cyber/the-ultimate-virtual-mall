import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantContext } from '@/lib/merchant';
import { FulfillmentStatus } from '@prisma/client';
import { apiError, HttpError, readJson } from '@/lib/http';

const VALID_STATUSES = new Set<FulfillmentStatus>([
  FulfillmentStatus.PENDING,
  FulfillmentStatus.CONFIRMED,
  FulfillmentStatus.PROCESSING,
  FulfillmentStatus.SHIPPED,
  FulfillmentStatus.READY_FOR_PICKUP,
  FulfillmentStatus.DELIVERED,
  FulfillmentStatus.CANCELLED,
]);

export async function GET() {
  try {
    const { shop } = await getMerchantContext();

    const orders = await prisma.sellerOrder.findMany({
      where: { shopId: shop.id },
      include: {
        parentOrder: {
          select: {
            orderNumber: true,
            deliveryAddress: true,
            paymentStatus: true,
            createdAt: true,
            customer: { select: { name: true, email: true, phone: true } },
            guestEmail: true,
            guestName: true,
            guestPhone: true,
          },
        },
        items: true,
        commissionRecord: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return apiError(error, 'merchant.orders.get');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { shop } = await getMerchantContext({ requireActive: true });

    const body = (await readJson(req)) as any;
    const { orderId, status, trackingNumber, courierName, sellerNotes } = body || {};

    if (!orderId) throw new HttpError(400, 'Order ID is required');

    // Strict tenant check: make sure this seller suborder belongs to the merchant's shop
    const existing = await prisma.sellerOrder.findUnique({
      where: { id: orderId },
      include: { parentOrder: true },
    });

    if (!existing || existing.shopId !== shop.id) {
      throw new HttpError(403, 'Forbidden: You do not have permission to manage this order');
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.has(status as FulfillmentStatus)) {
        throw new HttpError(400, `Invalid status value: ${status}`);
      }

      // Order must be paid before fulfillment status can progress beyond PENDING
      if (existing.parentOrder.paymentStatus !== 'PAID' && status !== FulfillmentStatus.PENDING && status !== FulfillmentStatus.CANCELLED) {
        throw new HttpError(400, 'Cannot change fulfillment status on an unpaid order');
      }

      // Block merchant cancelling paid orders unilaterally (requires admin refund handling)
      if (status === FulfillmentStatus.CANCELLED && existing.parentOrder.paymentStatus === 'PAID') {
        throw new HttpError(400, 'Paid orders cannot be cancelled directly by merchant. Contact mall admin for refund & cancellation.');
      }
    }

    const updated = await prisma.sellerOrder.update({
      where: { id: orderId },
      data: {
        ...(status ? { status: status as FulfillmentStatus } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber ? trackingNumber.trim() : null } : {}),
        ...(courierName !== undefined ? { courierName: courierName ? courierName.trim() : null } : {}),
        ...(sellerNotes !== undefined ? { sellerNotes: sellerNotes ? sellerNotes.trim() : null } : {}),
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return apiError(error, 'merchant.orders.patch');
  }
}
