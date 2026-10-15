import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    const orders = await prisma.parentOrder.findMany({
      where: {
        OR: [
          { customerId: user.id },
          { guestEmail: user.email },
        ],
      },
      include: {
        sellerOrders: {
          include: {
            shop: { select: { name: true, slug: true } },
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please sign in to view your orders' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
