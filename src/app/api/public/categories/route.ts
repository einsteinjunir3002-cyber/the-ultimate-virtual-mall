import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.mallCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'PUBLISHED',
                isAvailable: true,
                shop: { status: 'ACTIVE' },
              },
            },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
