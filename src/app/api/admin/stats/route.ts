import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { ApplicationStatus, PaymentStatus } from '@prisma/client';
import { apiError } from '@/lib/http';

export async function GET() {
  try {
    await requireSuperAdmin();

    const [
      totalShops,
      activeShops,
      pendingApplications,
      totalProducts,
      ordersAggregate,
      commissionsAggregate,
      recentOrders,
    ] = await Promise.all([
      prisma.shop.count(),
      prisma.shop.count({ where: { status: 'ACTIVE' } }),
      prisma.sellerApplication.count({ where: { status: ApplicationStatus.PENDING } }),
      prisma.product.count(),
      prisma.parentOrder.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.commissionRecord.aggregate({
        _sum: { commissionAmount: true },
      }),
      prisma.parentOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, email: true } },
          sellerOrders: {
            include: {
              shop: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalShops,
        activeShops,
        pendingApplications,
        totalProducts,
        totalPaidOrders: ordersAggregate._count.id || 0,
        totalGrossVolume: Number(ordersAggregate._sum.totalAmount || 0),
        totalCommissionEarned: Number(commissionsAggregate._sum.commissionAmount || 0),
      },
      recentOrders,
    });
  } catch (error) {
    return apiError(error, 'admin.stats.get');
  }
}
