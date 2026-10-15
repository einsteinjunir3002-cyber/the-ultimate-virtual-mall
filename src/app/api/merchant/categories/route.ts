import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantContext } from '@/lib/merchant';
import { categorySchema } from '@/lib/validation';
import { apiError, readJson } from '@/lib/http';

export async function GET() {
  try {
    const { shop } = await getMerchantContext();

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
    return apiError(error, 'merchant.categories.get');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { shop } = await getMerchantContext({ requireActive: true });

    const body = await readJson(req);
    const { name } = categorySchema.parse(body);

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'cat';

    const category = await prisma.shopCategory.create({
      data: {
        shopId: shop.id,
        name: name.trim(),
        slug,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    return apiError(error, 'merchant.categories.post');
  }
}

