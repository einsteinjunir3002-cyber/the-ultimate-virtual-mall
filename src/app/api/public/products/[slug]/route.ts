import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus, ShopStatus } from '@prisma/client';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.PUBLISHED,
        shop: { status: ShopStatus.ACTIVE },
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            tagline: true,
            description: true,
            logoUrl: true,
            location: true,
            phone: true,
            whatsappNumber: true,
            baseDeliveryFee: true,
            pickupAvailable: true,
            deliveryPolicy: true,
            returnPolicy: true,
            rating: true,
            reviewCount: true,
          },
        },
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
        mallCategory: true,
        shopCategory: true,
        reviews: {
          include: {
            customer: { select: { name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Increment view count asynchronously
    prisma.product
      .update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    // Fetch related products from the same shop or category (excluding current)
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        status: ProductStatus.PUBLISHED,
        isAvailable: true,
        OR: [
          { shopId: product.shopId },
          { mallCategoryId: product.mallCategoryId },
        ],
        shop: { status: ShopStatus.ACTIVE },
      },
      take: 4,
      include: {
        shop: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    return NextResponse.json({ product, relatedProducts });
  } catch (error) {
    console.error('Fetch product by slug error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
