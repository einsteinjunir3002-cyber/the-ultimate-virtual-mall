import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMerchant } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireMerchant();
    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

    const [shopCategories, mallCategories] = await Promise.all([
      prisma.shopCategory.findMany({
        where: { shopId: shop.id },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.mallCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    return NextResponse.json({ shopCategories, mallCategories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireMerchant();
    const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

    const body = await req.json();
    const { name } = body;
    if (!name) return NextResponse.json({ error: 'Category name is required' }, { status: 400 });

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const category = await prisma.shopCategory.create({
      data: {
        shopId: shop.id,
        name: name.trim(),
        slug,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
