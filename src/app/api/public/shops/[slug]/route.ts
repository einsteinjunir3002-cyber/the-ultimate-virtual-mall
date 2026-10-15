import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ShopStatus } from '@prisma/client';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: {
        shopCategories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        products: {
          where: {
            status: 'PUBLISHED',
            isAvailable: true,
          },
          include: {
            images: { orderBy: { displayOrder: 'asc' } },
            variants: true,
            shopCategory: true,
            mallCategory: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { products: true, reviews: true },
        },
      },
    });

    if (!shop || shop.status !== ShopStatus.ACTIVE) {
      return NextResponse.json({ error: 'Shop not found or currently inactive' }, { status: 404 });
    }

    return NextResponse.json({ shop });
  } catch (error) {
    console.error('Fetch shop by slug error:', error);
    return NextResponse.json({ error: 'Failed to fetch shop' }, { status: 500 });
  }
}
