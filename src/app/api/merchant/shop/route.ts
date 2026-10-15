import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMerchantContext } from '@/lib/merchant';
import { shopPatchSchema } from '@/lib/validation';
import { apiError, readJson } from '@/lib/http';

export async function GET() {
  try {
    const { shop } = await getMerchantContext();

    const fullShop = await prisma.shop.findUnique({
      where: { id: shop.id },
      include: {
        shopCategories: { orderBy: { displayOrder: 'asc' } },
        _count: { select: { products: true, sellerOrders: true } },
      },
    });

    return NextResponse.json({ shop: fullShop });
  } catch (error) {
    return apiError(error, 'merchant.shop.get');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { shop } = await getMerchantContext({ requireActive: true });

    const body = await readJson(req);
    const parsed = shopPatchSchema.parse(body);

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        ...(parsed.name ? { name: parsed.name } : {}),
        ...(parsed.tagline !== undefined ? { tagline: parsed.tagline } : {}),
        ...(parsed.description !== undefined ? { description: parsed.description } : {}),
        ...(parsed.logoUrl !== undefined ? { logoUrl: parsed.logoUrl } : {}),
        ...(parsed.bannerUrl !== undefined ? { bannerUrl: parsed.bannerUrl } : {}),
        ...(parsed.location ? { location: parsed.location } : {}),
        ...(parsed.phone ? { phone: parsed.phone } : {}),
        ...(parsed.whatsappNumber !== undefined ? { whatsappNumber: parsed.whatsappNumber } : {}),
        ...(parsed.themeColor ? { themeColor: parsed.themeColor } : {}),
        ...(parsed.templateStyle ? { templateStyle: parsed.templateStyle } : {}),
        ...(parsed.deliveryPolicy !== undefined ? { deliveryPolicy: parsed.deliveryPolicy } : {}),
        ...(parsed.returnPolicy !== undefined ? { returnPolicy: parsed.returnPolicy } : {}),
        ...(typeof parsed.pickupAvailable === 'boolean' ? { pickupAvailable: parsed.pickupAvailable } : {}),
        ...(parsed.baseDeliveryFee !== undefined ? { baseDeliveryFee: parsed.baseDeliveryFee } : {}),
      },
    });

    return NextResponse.json({ success: true, shop: updatedShop });
  } catch (error) {
    return apiError(error, 'merchant.shop.patch');
  }
}

