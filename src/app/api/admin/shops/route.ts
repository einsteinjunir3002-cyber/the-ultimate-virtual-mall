import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { ShopStatus } from '@prisma/client';
import { apiError, HttpError, readJson } from '@/lib/http';

const VALID_SHOP_STATUSES = new Set<ShopStatus>([
  ShopStatus.ACTIVE,
  ShopStatus.SUSPENDED,
  ShopStatus.PENDING_REVIEW,
]);

export async function GET() {
  try {
    await requireSuperAdmin();

    const shops = await prisma.shop.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: { products: true, sellerOrders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ shops });
  } catch (error) {
    return apiError(error, 'admin.shops.get');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = (await readJson(req)) as any;
    const { shopId, status, isFeatured } = body || {};

    if (!shopId) {
      throw new HttpError(400, 'Shop ID is required');
    }

    if (status !== undefined && !VALID_SHOP_STATUSES.has(status as ShopStatus)) {
      throw new HttpError(400, `Invalid shop status: ${status}`);
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        ...(status ? { status: status as ShopStatus } : {}),
        ...(typeof isFeatured === 'boolean' ? { isFeatured } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        userRole: admin.role,
        action: 'UPDATE_SHOP_STATUS',
        entity: 'Shop',
        entityId: shopId,
        details: { status, isFeatured },
      },
    });

    return NextResponse.json({ success: true, shop: updatedShop });
  } catch (error) {
    return apiError(error, 'admin.shops.patch');
  }
}
