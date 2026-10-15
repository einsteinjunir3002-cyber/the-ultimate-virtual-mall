import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { SettlementStatus } from '@prisma/client';
import { apiError, HttpError, readJson } from '@/lib/http';

const VALID_SETTLEMENT_STATUSES = new Set<SettlementStatus>([
  SettlementStatus.UNSETTLED,
  SettlementStatus.SETTLED,
  SettlementStatus.DISPUTED,
]);

export async function POST(req: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = (await readJson(req)) as any;
    const { commissionRecordId, status, settlementNotes } = body || {};

    if (!commissionRecordId) {
      throw new HttpError(400, 'Commission record ID is required');
    }

    const targetStatus = status || SettlementStatus.SETTLED;
    if (!VALID_SETTLEMENT_STATUSES.has(targetStatus)) {
      throw new HttpError(400, `Invalid settlement status: ${targetStatus}`);
    }

    const record = await prisma.commissionRecord.findUnique({
      where: { id: commissionRecordId },
      include: {
        sellerOrder: { include: { parentOrder: true } },
        shop: { select: { name: true } },
      },
    });

    if (!record) {
      throw new HttpError(404, 'Commission record not found');
    }

    if (record.sellerOrder.parentOrder.paymentStatus !== 'PAID') {
      throw new HttpError(400, 'Cannot settle commission for an unpaid order');
    }

    const updated = await prisma.commissionRecord.update({
      where: { id: commissionRecordId },
      data: {
        settlementStatus: targetStatus,
        settledAt: targetStatus === SettlementStatus.SETTLED ? new Date() : null,
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
        details: { status: targetStatus, settlementNotes, shop: updated.shop.name },
      },
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    return apiError(error, 'admin.settlements.post');
  }
}
