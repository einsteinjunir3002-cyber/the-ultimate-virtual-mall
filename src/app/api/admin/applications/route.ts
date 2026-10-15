import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { ApplicationStatus, Role, ShopStatus, TemplateStyle } from '@prisma/client';

export async function GET() {
  try {
    await requireSuperAdmin();

    const applications = await prisma.sellerApplication.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN_NOT_SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = await req.json();
    const { applicationId, action, adminNotes } = body;

    if (!applicationId || !action) {
      return NextResponse.json({ error: 'Application ID and action are required' }, { status: 400 });
    }

    const application = await prisma.sellerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      // 1. Check if slug is available
      const slugExists = await prisma.shop.findUnique({
        where: { slug: application.desiredSlug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: `The slug "${application.desiredSlug}" is already taken by another shop.` },
          { status: 409 }
        );
      }

      // 2. Provision the Shop in a transaction
      const newShop = await prisma.$transaction(async (tx) => {
        // Create Shop
        const shop = await tx.shop.create({
          data: {
            ownerId: application.userId,
            name: application.shopName,
            slug: application.desiredSlug,
            businessCategory: application.category,
            description: application.description,
            location: application.location,
            phone: application.phone,
            whatsappNumber: application.whatsappNumber,
            email: application.user.email,
            status: ShopStatus.ACTIVE,
            templateStyle: TemplateStyle.MODERN_MINIMAL,
            themeColor: '#0f172a',
            deliveryPolicy:
              application.proposedDelivery ||
              'Standard delivery arranged directly by merchant or customer pickup available.',
            returnPolicy: 'Standard return policy: Returns accepted within 7 days in original condition.',
            pickupAvailable: true,
            baseDeliveryFee: 25.0,
          },
        });

        // Provision default shop categories for the merchant to organize products
        await tx.shopCategory.createMany({
          data: [
            { shopId: shop.id, name: 'Featured Items', slug: 'featured', displayOrder: 1 },
            { shopId: shop.id, name: 'New Arrivals', slug: 'new-arrivals', displayOrder: 2 },
            { shopId: shop.id, name: 'Best Sellers', slug: 'best-sellers', displayOrder: 3 },
          ],
        });

        // Update application status
        await tx.sellerApplication.update({
          where: { id: application.id },
          data: {
            status: ApplicationStatus.APPROVED,
            reviewedAt: new Date(),
            adminNotes: adminNotes || 'Approved by Super Admin Big Sam.',
          },
        });

        // Ensure user role is MERCHANT
        await tx.user.update({
          where: { id: application.userId },
          data: { role: Role.MERCHANT },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            userId: admin.id,
            userRole: admin.role,
            action: 'APPROVE_MERCHANT_APPLICATION',
            entity: 'Shop',
            entityId: shop.id,
            details: {
              applicationId: application.id,
              shopName: shop.name,
              shopSlug: shop.slug,
            },
          },
        });

        return shop;
      });

      return NextResponse.json({
        success: true,
        message: `Application approved! Storefront "${newShop.name}" has been provisioned.`,
        shop: newShop,
      });
    } else if (action === 'REJECT') {
      await prisma.sellerApplication.update({
        where: { id: application.id },
        data: {
          status: ApplicationStatus.REJECTED,
          reviewedAt: new Date(),
          adminNotes: adminNotes || 'Application rejected by platform administration.',
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          userRole: admin.role,
          action: 'REJECT_MERCHANT_APPLICATION',
          entity: 'SellerApplication',
          entityId: application.id,
          details: { reason: adminNotes },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Application marked as rejected.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin application action error:', error);
    if (error instanceof Error && error.message === 'FORBIDDEN_NOT_SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
