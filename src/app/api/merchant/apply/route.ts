import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { ApplicationStatus, Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const {
      shopName,
      desiredSlug,
      category,
      description,
      phone,
      whatsappNumber,
      location,
      businessRegNumber,
      nationalIdNumber,
      proposedDelivery,
    } = body;

    if (!shopName || !desiredSlug || !category || !description || !phone || !location) {
      return NextResponse.json(
        { error: 'Please provide all required business details' },
        { status: 400 }
      );
    }

    // Clean and validate slug
    const cleanSlug = desiredSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (cleanSlug.length < 3) {
      return NextResponse.json(
        { error: 'Shop URL slug must be at least 3 characters long and alphanumeric' },
        { status: 400 }
      );
    }

    // Check if slug is reserved or taken by an active shop
    const existingShop = await prisma.shop.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingShop) {
      return NextResponse.json(
        { error: 'This shop URL is already taken. Please choose another unique name.' },
        { status: 409 }
      );
    }

    // Check if user already has an active shop
    const userShop = await prisma.shop.findFirst({
      where: { ownerId: user.id },
    });

    if (userShop) {
      return NextResponse.json(
        { error: 'You already operate a registered shop on this account.' },
        { status: 400 }
      );
    }

    // Check if user has an existing pending application
    const existingApp = await prisma.sellerApplication.findFirst({
      where: {
        userId: user.id,
        status: ApplicationStatus.PENDING,
      },
    });

    if (existingApp) {
      return NextResponse.json(
        { error: 'You already have an application under review by mall management.' },
        { status: 400 }
      );
    }

    // Create SellerApplication
    const application = await prisma.sellerApplication.create({
      data: {
        userId: user.id,
        shopName: shopName.trim(),
        desiredSlug: cleanSlug,
        category,
        description: description.trim(),
        phone: phone.trim(),
        whatsappNumber: whatsappNumber ? whatsappNumber.trim() : null,
        location: location.trim(),
        businessRegNumber: businessRegNumber ? businessRegNumber.trim() : null,
        nationalIdNumber: nationalIdNumber ? nationalIdNumber.trim() : null,
        proposedDelivery: proposedDelivery ? proposedDelivery.trim() : null,
        status: ApplicationStatus.PENDING,
      },
    });

    // Ensure user role is at least MERCHANT
    if (user.role === Role.CUSTOMER) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: Role.MERCHANT },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: 'SUBMIT_MERCHANT_APPLICATION',
        entity: 'SellerApplication',
        entityId: application.id,
        details: { shopName, desiredSlug: cleanSlug, category },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your merchant application has been submitted and is under review.',
      application,
    });
  } catch (error) {
    console.error('Merchant application error:', error);
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please sign in to submit a shop application' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireAuth();

    const application = await prisma.sellerApplication.findFirst({
      where: { userId: user.id },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ application });
  } catch {
    return NextResponse.json({ application: null });
  }
}
