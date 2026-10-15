/**
 * Platform Commission & Money Flow Calculations
 * Distinguishes between:
 * 1. Customer Payment
 * 2. Platform Commission
 * 3. Merchant Net Earnings
 * 4. Delivery Charges (belonging to merchant or fulfillment provider)
 */

export interface SplitCalculation {
  itemsTotal: number;
  deliveryFee: number;
  commissionRatePercent: number;
  commissionAmount: number;
  sellerEarnings: number;
  orderTotal: number;
}

/**
 * Calculates marketplace commission and seller net earnings safely using minor units (pesewas)
 */
export function calculateSellerSplit(
  itemsTotal: number,
  deliveryFee: number = 0,
  commissionPercent: number = 5.0
): SplitCalculation {
  const itemsPesewas = Math.round(itemsTotal * 100);
  const deliveryPesewas = Math.round(deliveryFee * 100);

  // Platform commission is calculated on the merchandise items total
  const commissionPesewas = Math.round((itemsPesewas * commissionPercent) / 100);
  const sellerEarningsPesewas = itemsPesewas - commissionPesewas + deliveryPesewas;
  const orderTotalPesewas = itemsPesewas + deliveryPesewas;

  return {
    itemsTotal: itemsPesewas / 100,
    deliveryFee: deliveryPesewas / 100,
    commissionRatePercent: commissionPercent,
    commissionAmount: commissionPesewas / 100,
    sellerEarnings: sellerEarningsPesewas / 100,
    orderTotal: orderTotalPesewas / 100,
  };
}

/**
 * Format currency in Ghana cedis (GH₵)
 * Supports numbers, strings, and Prisma Decimal objects
 */
export function formatGhs(amount: number | string | any | null | undefined): string {
  if (amount === null || amount === undefined) return 'GH₵ 0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(num)) return 'GH₵ 0.00';
  return `GH₵ ${num.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
