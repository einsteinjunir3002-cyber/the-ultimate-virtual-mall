import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ShopStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    const shops = await prisma.shop.findMany({
      where: {
        status: ShopStatus.ACTIVE,
        ...(category ? { businessCategory: { contains: category, mode: 'insensitive' } } : {}),
        ...(featured === 'true' ? { isFeatured: true } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            products: {
              where: { status: 'PUBLISHED', isAvailable: true },
            },
          },
        },
      },
    });

    shops.sort((a, b) => {
      if (a.slug === 'accra-gadget-hub-test') return -1;
      if (b.slug === 'accra-gadget-hub-test') return 1;
      return 0;
    });

    return NextResponse.json({ shops });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
  }
}
