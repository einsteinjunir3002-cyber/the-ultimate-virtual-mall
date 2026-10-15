import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { SettlementStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = await req.json();
    const { commissionRecordId, status, settlementNotes } = body;

    if (!commissionRecordId) {
      return NextResponse.json({ error: 'Commission record ID is required' }, { status: 400 });
    }

    const updated = await prisma.commissionRecord.update({
      where: { id: commissionRecordId },
      data: {
        settlementStatus: status || SettlementStatus.SETTLED,
        settledAt: status === SettlementStatus.SETTLED ? new Date() : null,
        settlementNotes: settlementNotes || 'Settled manually by Super Admin Big Sam',
      },
      include: {
        shop: { select: { name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        userRole: admin.role,
        action: 'UPDATE_SETTLEMENT_STATUS',
        entity: 'CommissionRecord',
        entityId: commissionRecordId,
        details: { status, settlementNotes, shop: updated.shop.name },
      },
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    console.error('Settlement update error:', error);
    if (error instanceof Error && error.message === 'FORBIDDEN_NOT_SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to update settlement' }, { status: 500 });
  }
}
