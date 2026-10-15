import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMerchant } from '@/lib/auth';
import { FulfillmentStatus } from '@prisma/client';

export async function GET() {
  try {
    const user = await requireMerchant();
    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

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
    return NextResponse.json({ error: 'Failed to fetch merchant orders' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireMerchant();
    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

    const body = await req.json();
    const { orderId, status, trackingNumber, courierName, sellerNotes } = body;

    if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    // Strict tenant check: make sure this seller suborder belongs to the merchant's shop
    const existing = await prisma.sellerOrder.findUnique({
      where: { id: orderId },
    });

    if (!existing || existing.shopId !== shop.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to manage this order' },
        { status: 403 }
      );
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
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
