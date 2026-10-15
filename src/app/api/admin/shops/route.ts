import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { ShopStatus } from '@prisma/client';

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
    if (error instanceof Error && error.message === 'FORBIDDEN_NOT_SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = await req.json();
    const { shopId, status, isFeatured } = body;

    if (!shopId) {
      return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
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
    console.error('Update shop status error:', error);
    if (error instanceof Error && error.message === 'FORBIDDEN_NOT_SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 });
  }
}
