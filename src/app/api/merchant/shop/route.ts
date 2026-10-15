import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMerchant } from '@/lib/auth';
import { TemplateStyle } from '@prisma/client';

export async function GET() {
  try {
    const user = await requireMerchant();

    const shop = await prisma.shop.findFirst({
      where: { ownerId: user.id },
      include: {
        shopCategories: { orderBy: { displayOrder: 'asc' } },
        _count: { select: { products: true, sellerOrders: true } },
      },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found for this account' }, { status: 404 });
    }

    return NextResponse.json({ shop });
  } catch (error) {
    if (error instanceof Error && error.message.includes('FORBIDDEN')) {
      return NextResponse.json({ error: 'Merchant authorization required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch shop profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireMerchant();

    const shop = await prisma.shop.findFirst({
      where: { ownerId: user.id },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      tagline,
      description,
      logoUrl,
      bannerUrl,
      location,
      phone,
      whatsappNumber,
      themeColor,
      templateStyle,
      deliveryPolicy,
      returnPolicy,
      pickupAvailable,
      baseDeliveryFee,
    } = body;

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(tagline !== undefined ? { tagline: tagline?.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(bannerUrl !== undefined ? { bannerUrl } : {}),
        ...(location ? { location: location.trim() } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
        ...(whatsappNumber !== undefined ? { whatsappNumber: whatsappNumber?.trim() } : {}),
        ...(themeColor ? { themeColor } : {}),
        ...(templateStyle ? { templateStyle: templateStyle as TemplateStyle } : {}),
        ...(deliveryPolicy !== undefined ? { deliveryPolicy } : {}),
        ...(returnPolicy !== undefined ? { returnPolicy } : {}),
        ...(typeof pickupAvailable === 'boolean' ? { pickupAvailable } : {}),
        ...(baseDeliveryFee !== undefined ? { baseDeliveryFee: Number(baseDeliveryFee) } : {}),
      },
    });

    return NextResponse.json({ success: true, shop: updatedShop });
  } catch (error) {
    console.error('Update shop error:', error);
    return NextResponse.json({ error: 'Failed to update shop profile' }, { status: 500 });
  }
}
