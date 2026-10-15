import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { apiError } from '@/lib/http';

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
    return apiError(error, 'admin.orders.get');
  }
}
