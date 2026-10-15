import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireSuperAdmin();

    const orders = await prisma.parentOrder.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        sellerOrders: {
          include: {
            shop: { select: { id: true, name: true, slug: true } },
            items: true,
            commissionRecord: true,
          },
        },
        paymentTransactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN_NOT_SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch platform orders' }, { status: 500 });
  }
}
