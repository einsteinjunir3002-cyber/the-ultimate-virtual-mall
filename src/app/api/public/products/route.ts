import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus, ShopStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('q');
    const categorySlug = searchParams.get('category');
    const shopSlug = searchParams.get('shop');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'latest';

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'popular') orderBy = { viewCount: 'desc' };

    const products = await prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        isAvailable: true,
        shop: {
          status: ShopStatus.ACTIVE,
          ...(shopSlug ? { slug: shopSlug } : {}),
        },
        ...(categorySlug ? { mallCategory: { slug: categorySlug } } : {}),
        ...(minPrice ? { price: { gte: Number(minPrice) } } : {}),
        ...(maxPrice ? { price: { lte: Number(maxPrice) } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            baseDeliveryFee: true,
            whatsappNumber: true,
            logoUrl: true,
            location: true,
          },
        },
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
        mallCategory: true,
      },
      orderBy,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
