import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMerchant } from '@/lib/auth';
import { FulfillmentStatus, PaymentStatus, SettlementStatus } from '@prisma/client';

export async function GET() {
  try {
    const user = await requireMerchant();
    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

    const [
      totalOrders,
      pendingOrders,
      productsCount,
      allProducts,
      commissions,
    ] = await Promise.all([
      prisma.sellerOrder.count({ where: { shopId: shop.id } }),
      prisma.sellerOrder.count({
        where: {
          shopId: shop.id,
          status: { in: [FulfillmentStatus.PENDING, FulfillmentStatus.CONFIRMED, FulfillmentStatus.PROCESSING] },
        },
      }),
      prisma.product.count({ where: { shopId: shop.id } }),
      prisma.product.findMany({
        where: { shopId: shop.id },
        select: { id: true, name: true, stock: true, lowStockThreshold: true },
      }),
      prisma.commissionRecord.findMany({
        where: { shopId: shop.id },
        include: {
          sellerOrder: {
            include: {
              parentOrder: { select: { paymentStatus: true } },
            },
          },
        },
      }),
    ]);

    // Count low stock products
    const lowStockProducts = allProducts.filter((p) => p.stock <= p.lowStockThreshold);

    // Sum actual gross sales and net seller earnings for paid orders
    let totalGrossSales = 0;
    let totalNetEarnings = 0;
    let totalSettled = 0;
    let totalUnsettled = 0;

    commissions.forEach((c) => {
      if (c.sellerOrder.parentOrder.paymentStatus === PaymentStatus.PAID) {
        totalGrossSales += Number(c.grossAmount);
        totalNetEarnings += Number(c.netSellerAmount);

        if (c.settlementStatus === SettlementStatus.SETTLED) {
          totalSettled += Number(c.netSellerAmount);
        } else {
          totalUnsettled += Number(c.netSellerAmount);
        }
      }
    });

    return NextResponse.json({
      shopName: shop.name,
      shopSlug: shop.slug,
      stats: {
        totalOrders,
        pendingOrders,
        productsCount,
        lowStockCount: lowStockProducts.length,
        totalGrossSales,
        totalNetEarnings,
        totalSettled,
        totalUnsettled,
      },
      lowStockProducts: lowStockProducts.slice(0, 5),
    });
  } catch (error) {
    console.error('Merchant stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch merchant stats' }, { status: 500 });
  }
}
