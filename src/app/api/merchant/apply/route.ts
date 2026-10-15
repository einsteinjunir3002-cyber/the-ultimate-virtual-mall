import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { ApplicationStatus } from '@prisma/client';
import { applicationSchema } from '@/lib/validation';
import { apiError, HttpError, readJson } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await readJson(req);
    const parsed = applicationSchema.parse(body);

    const cleanSlug = parsed.desiredSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (cleanSlug.length < 3) {
      throw new HttpError(400, 'Shop URL slug must be at least 3 characters long and alphanumeric');
    }

    // Check if slug is reserved or taken by an active shop
    const existingShop = await prisma.shop.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingShop) {
      throw new HttpError(409, 'This shop URL is already taken. Please choose another unique name.');
    }

    // Check if user already has an active shop
    const userShop = await prisma.shop.findFirst({
      where: { ownerId: user.id },
    });

    if (userShop) {
      throw new HttpError(400, 'You already operate a registered shop on this account.');
    }

    // Check if user has an existing pending application
    const existingApp = await prisma.sellerApplication.findFirst({
      where: {
        userId: user.id,
        status: ApplicationStatus.PENDING,
      },
    });

    if (existingApp) {
      throw new HttpError(400, 'You already have an application under review by mall management.');
    }

    // Create SellerApplication
    const application = await prisma.sellerApplication.create({
      data: {
        userId: user.id,
        shopName: parsed.shopName,
        desiredSlug: cleanSlug,
        category: parsed.category,
        description: parsed.description,
        phone: parsed.phone,
        whatsappNumber: parsed.whatsappNumber || null,
        location: parsed.location,
        businessRegNumber: parsed.businessRegNumber || null,
        nationalIdNumber: parsed.nationalIdNumber || null,
        proposedDelivery: parsed.proposedDelivery || null,
        status: ApplicationStatus.PENDING,
      },
    });

    // Role is NOT promoted to MERCHANT here; superadmin approval promotes it.

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: 'SUBMIT_MERCHANT_APPLICATION',
        entity: 'SellerApplication',
        entityId: application.id,
        details: { shopName: parsed.shopName, desiredSlug: cleanSlug, category: parsed.category },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your merchant application has been submitted and is under review.',
      application,
    });
  } catch (error) {
    return apiError(error, 'merchant.apply');
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
