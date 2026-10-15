import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET() {
  const config = await prisma.platformConfig.findUnique({
    where: { id: 'default' },
  });
  return NextResponse.json({ config });
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = await req.json();
    const {
      mallName,
      mallTagline,
      contactEmail,
      contactPhone,
      whatsappSupport,
      defaultCommissionPercent,
      maintenanceMode,
    } = body;

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
    if (error instanceof Error && error.message === 'FORBIDDEN_NOT_SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
