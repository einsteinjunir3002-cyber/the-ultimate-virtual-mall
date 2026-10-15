import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { PaymentStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Product ID, rating (1-5), and comment are required' }, { status: 400 });
    }

    const numRating = parseInt(rating, 10);
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5 stars' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Verified purchase check: user must have a paid order containing this product
    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        sellerOrder: {
          parentOrder: {
            customerId: user.id,
            paymentStatus: PaymentStatus.PAID,
          },
        },
      },
    });

    if (!verifiedPurchase) {
      return NextResponse.json(
        {
          error:
            'Only verified purchasers who have ordered and paid for this item can submit a product review.',
        },
        { status: 403 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { productId, customerId: user.id },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this product' },
        { status: 400 }
      );
    }

    // Create review and update shop average rating
    const review = await prisma.$transaction(async (tx) => {
      const rev = await tx.review.create({
        data: {
          productId,
          shopId: product.shopId,
          customerId: user.id,
          rating: numRating,
          comment: comment.trim(),
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
    console.error('Review submission error:', error);
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please sign in to submit a review' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
