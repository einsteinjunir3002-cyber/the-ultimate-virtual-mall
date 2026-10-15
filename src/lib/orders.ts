import { FulfillmentStatus, PaymentStatus } from '@prisma/client';
import { prisma } from './prisma';

/** How long an unpaid order may hold stock before it is released. */
export const PENDING_ORDER_TTL_MINUTES = 30;

/**
 * Release the stock held by an UNPAID order and mark it FAILED/CANCELLED.
 * Idempotent: the PENDING → final transition is a single conditional update, so
 * concurrent callers can only restock once.
 */
export async function releaseOrderStock(orderId: string, finalStatus: 'FAILED' | 'CANCELLED'): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const flipped = await tx.parentOrder.updateMany({
      where: { id: orderId, paymentStatus: PaymentStatus.PENDING },
      data: { paymentStatus: finalStatus === 'FAILED' ? PaymentStatus.FAILED : PaymentStatus.CANCELLED },
    });
    if (flipped.count === 0) return false;

    const sellerOrders = await tx.sellerOrder.findMany({ where: { parentOrderId: orderId }, include: { items: true } });
    for (const so of sellerOrders) {
      for (const it of so.items) {
        if (it.variantId) {
          await tx.productVariant.updateMany({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } });
        } else if (!it.variantName) {
          await tx.product.updateMany({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
        }
      }
    }
    await tx.sellerOrder.updateMany({ where: { parentOrderId: orderId }, data: { status: FulfillmentStatus.CANCELLED } });
    return true;
  });
}

/** Lazily release stock held by abandoned checkouts. Safe to call often. */
export async function releaseExpiredPendingOrders(limit = 25): Promise<number> {
  const cutoff = new Date(Date.now() - PENDING_ORDER_TTL_MINUTES * 60_000);
  const stale = await prisma.parentOrder.findMany({
    where: { paymentStatus: PaymentStatus.PENDING, createdAt: { lt: cutoff } },
    select: { id: true },
    take: limit,
  });
  let released = 0;
  for (const s of stale) if (await releaseOrderStock(s.id, 'CANCELLED')) released++;
  return released;
}

export interface ProviderPayment {
  reference: string;
  status: string; // provider status, e.g. 'success'
  amountPesewas: number;
  currency: string;
  channel?: string | null;
  paidAt?: string | null;
  gatewayResponse?: string | null;
  raw: unknown;
}

export type SettleResult = 'paid' | 'paid_needs_attention' | 'already_paid' | 'amount_mismatch' | 'not_successful';

class StockConflict extends Error {}

/**
 * Single place where an order becomes PAID. Used by BOTH the verify endpoint and
 * the webhook so behaviour is identical and idempotent.
 *  - the provider amount and currency must match what we charged
 *  - if the order's stock was already released (late payment), re-reserve it, or
 *    flag the seller orders for manual attention/refund if that is impossible
 */
export async function settleOrderPayment(orderId: string, p: ProviderPayment): Promise<SettleResult> {
  if (p.status !== 'success') return 'not_successful';

  const order = await prisma.parentOrder.findUnique({ where: { id: orderId }, include: { sellerOrders: { include: { items: true } } } });
  if (!order) return 'not_successful';
  if (order.paymentStatus === PaymentStatus.PAID) return 'already_paid';

  const expected = Math.round(Number(order.totalAmount) * 100);
  if (p.amountPesewas !== expected || p.currency.toUpperCase() !== order.currency.toUpperCase()) {
    console.error(`[payments] amount/currency mismatch for ${order.orderNumber}: expected ${expected} ${order.currency}, provider says ${p.amountPesewas} ${p.currency}`);
    await prisma.paymentTransaction.upsert({
      where: { reference: p.reference },
      update: { status: 'amount_mismatch', gatewayResponse: `Provider amount ${p.amountPesewas} ${p.currency} != expected ${expected}` },
      create: {
        parentOrderId: order.id, provider: 'PAYSTACK', reference: p.reference, amount: Number(order.totalAmount),
        currency: order.currency, channel: p.channel ?? null, status: 'amount_mismatch',
        gatewayResponse: `Provider amount ${p.amountPesewas} ${p.currency} != expected ${expected}`, rawResponse: p.raw as object,
      },
    });
    return 'amount_mismatch';
  }

  const stockWasReleased = order.paymentStatus === PaymentStatus.FAILED || order.paymentStatus === PaymentStatus.CANCELLED;
  const paidAt = p.paidAt ? new Date(p.paidAt) : new Date();

  const commit = async (reReserve: boolean, flagNote: string | null): Promise<SettleResult> => {
    return prisma.$transaction(async (tx) => {
      const flipped = await tx.parentOrder.updateMany({
        where: { id: order.id, paymentStatus: { not: PaymentStatus.PAID } },
        data: { paymentStatus: PaymentStatus.PAID, paidAt },
      });
      if (flipped.count === 0) return 'already_paid';

      if (reReserve) {
        for (const so of order.sellerOrders) {
          for (const it of so.items) {
            const res = it.variantId
              ? await tx.productVariant.updateMany({ where: { id: it.variantId, stock: { gte: it.quantity } }, data: { stock: { decrement: it.quantity } } })
              : await tx.product.updateMany({ where: { id: it.productId, stock: { gte: it.quantity } }, data: { stock: { decrement: it.quantity } } });
            if (res.count === 0) throw new StockConflict();
          }
        }
      }

      await tx.sellerOrder.updateMany({
        where: { parentOrderId: order.id },
        data: flagNote
          ? { status: FulfillmentStatus.PENDING, sellerNotes: flagNote }
          : { status: FulfillmentStatus.CONFIRMED },
      });

      await tx.paymentTransaction.upsert({
        where: { reference: p.reference },
        update: { status: 'success', paidAt, gatewayResponse: p.gatewayResponse ?? 'Approved', channel: p.channel ?? null },
        create: {
          parentOrderId: order.id, provider: 'PAYSTACK', reference: p.reference, amount: Number(order.totalAmount),
          currency: order.currency, channel: p.channel ?? null, status: 'success',
          gatewayResponse: p.gatewayResponse ?? 'Approved', paidAt, rawResponse: p.raw as object,
        },
      });
      return flagNote ? 'paid_needs_attention' : 'paid';
    });
  };

  if (!stockWasReleased) return commit(false, null);

  try {
    return await commit(true, null);
  } catch (e) {
    if (!(e instanceof StockConflict)) throw e;
    return commit(
      false,
      'ATTENTION: customer paid AFTER the reservation expired and stock could not be re-reserved. Confirm availability with the customer or ask mall support to refund.'
    );
  }
}
