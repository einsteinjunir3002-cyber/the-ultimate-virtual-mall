import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus, ShopStatus } from '@prisma/client';
import { apiError } from '@/lib/http';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('q');
    const categorySlug = searchParams.get('category');
    const shopSlug = searchParams.get('shop');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'latest';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    // Price filter combines both gte and lte without overwriting
    const priceFilter: { gte?: number; lte?: number } = {};
    if (minPrice && !isNaN(Number(minPrice))) priceFilter.gte = Number(minPrice);
    if (maxPrice && !isNaN(Number(maxPrice))) priceFilter.lte = Number(maxPrice);

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'popular') orderBy = { viewCount: 'desc' };

    const where: any = {
      status: ProductStatus.PUBLISHED,
      isAvailable: true,
      shop: {
        status: ShopStatus.ACTIVE,
        ...(shopSlug ? { slug: shopSlug } : {}),
      },
      ...(categorySlug
        ? {
            OR: [
              { mallCategory: { slug: categorySlug } },
              { shopCategory: { slug: categorySlug } },
            ],
          }
        : {}),
      ...(Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
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
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return apiError(error, 'public.products.get');
  }
}
