import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { apiError, readJson } from '@/lib/http';

export async function GET() {
  try {
    await requireSuperAdmin();
    const config = await prisma.platformConfig.findUnique({
      where: { id: 'default' },
    });
    return NextResponse.json({ config });
  } catch (error) {
    return apiError(error, 'admin.config.get');
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = (await readJson(req)) as any;
    const {
      mallName,
      mallTagline,
      contactEmail,
      contactPhone,
      whatsappSupport,
      defaultCommissionPercent,
      maintenanceMode,
    } = body || {};

    const config = await prisma.platformConfig.upsert({
      where: { id: 'default' },
      update: {
        ...(mallName ? { mallName } : {}),
        ...(mallTagline ? { mallTagline } : {}),
        ...(contactEmail ? { contactEmail } : {}),
        ...(contactPhone ? { contactPhone } : {}),
        ...(whatsappSupport ? { whatsappSupport } : {}),
        ...(defaultCommissionPercent !== undefined
          ? { defaultCommissionPercent: Number(defaultCommissionPercent) }
          : {}),
        ...(maintenanceMode !== undefined ? { maintenanceMode: Boolean(maintenanceMode) } : {}),
      },
      create: {
        id: 'default',
        mallName: mallName || 'The Ultimate Virtual Mall',
        mallTagline: mallTagline || "Ghana's Premier Digital Shopping Destination",
        contactEmail: contactEmail || 'support@theultimatemall.com',
        contactPhone: contactPhone || '+233 24 123 4567',
        whatsappSupport: whatsappSupport || '+233241234567',
        defaultCommissionPercent: defaultCommissionPercent ? Number(defaultCommissionPercent) : 5.0,
        maintenanceMode: Boolean(maintenanceMode),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        userRole: admin.role,
        action: 'UPDATE_PLATFORM_CONFIG',
        entity: 'PlatformConfig',
        entityId: 'default',
        details: body,
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    return apiError(error, 'admin.config.post');
  }
}
