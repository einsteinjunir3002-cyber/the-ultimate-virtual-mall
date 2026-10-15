import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await context.params;
    const user = await getCurrentUser();

    const order = await prisma.parentOrder.findUnique({
      where: { orderNumber },
      include: {
        sellerOrders: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
                slug: true,
                phone: true,
                whatsappNumber: true,
                logoUrl: true,
              },
            },
            items: true,
          },
        },
        paymentTransactions: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If order has customerId and user is signed in, verify ownership (unless super admin)
    if (order.customerId && user && user.role !== 'SUPER_ADMIN' && order.customerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
