import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PaymentStatus, FulfillmentStatus } from '@prisma/client';
import { reviewSchema } from '@/lib/validation';
import { apiError, HttpError, readJson } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await readJson(req);
    const parsed = reviewSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: { id: parsed.productId },
    });

    if (!product) {
      throw new HttpError(404, 'Product not found');
    }

    // Merchants cannot review products from their own shop
    const ownedShop = await prisma.shop.findFirst({
      where: { ownerId: user.id, id: product.shopId },
    });
    if (ownedShop) {
      throw new HttpError(403, 'Merchants cannot review products from their own shop');
    }

    // Verified purchase check: user must have an order with this product that is PAID and DELIVERED
    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        productId: parsed.productId,
        sellerOrder: {
          status: FulfillmentStatus.DELIVERED,
          parentOrder: {
            customerId: user.id,
            paymentStatus: PaymentStatus.PAID,
          },
        },
      },
    });

    if (!verifiedPurchase) {
      throw new HttpError(
        403,
        'Only verified purchasers whose order has been delivered can submit a product review.'
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { productId: parsed.productId, customerId: user.id },
    });

    if (existingReview) {
      throw new HttpError(400, 'You have already submitted a review for this product');
    }

    // Create review and update shop average rating
    const review = await prisma.$transaction(async (tx) => {
      const rev = await tx.review.create({
        data: {
          productId: parsed.productId,
          shopId: product.shopId,
          customerId: user.id,
          rating: parsed.rating,
          comment: parsed.comment,
          isVerifiedPurchase: true,
        },
      });

      // Recalculate shop rating
      const shopReviews = await tx.review.findMany({
        where: { shopId: product.shopId },
        select: { rating: true },
      });

      const avgRating =
        shopReviews.reduce((sum, r) => sum + r.rating, 0) / (shopReviews.length || 1);

      await tx.shop.update({
        where: { id: product.shopId },
        data: {
          rating: Number(avgRating.toFixed(2)),
          reviewCount: shopReviews.length,
        },
      });

      return rev;
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    return apiError(error, 'public.reviews.post');
  }
}
