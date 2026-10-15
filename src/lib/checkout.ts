import crypto from 'node:crypto';
import { HttpError } from './http';

/**
 * Pure checkout pricing/validation logic (no database access) so it can be
 * unit-tested. All money is handled as integer pesewas (1 GH₵ = 100 pesewas).
 */

export const MAX_LINE_QTY = 50;

export interface RawLine {
  productId: string;
  variantId?: string | null;
  quantity: unknown;
}

export interface Line {
  productId: string;
  variantId: string | null;
  quantity: number;
}

export interface CatalogVariant {
  id: string;
  name: string;
  price: number; // GH₵
  salePrice: number | null;
  stock: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  shopId: string;
  shopName: string;
  price: number; // GH₵
  salePrice: number | null;
  stock: number;
  deliveryFee: number; // GH₵ (shop base fee)
  image: string | null;
  variants: CatalogVariant[];
}

export interface PlannedItem {
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  unitPesewas: number;
  quantity: number;
  subtotalPesewas: number;
  image: string | null;
}

export interface PlannedShopOrder {
  shopId: string;
  shopName: string;
  items: PlannedItem[];
  itemsPesewas: number;
  deliveryPesewas: number;
  commissionPesewas: number;
  sellerEarningsPesewas: number;
  totalPesewas: number;
}

export interface CheckoutPlan {
  shops: PlannedShopOrder[];
  itemsPesewas: number;
  deliveryPesewas: number;
  totalPesewas: number;
}

export const toPesewas = (ghs: number) => Math.round(ghs * 100);
export const fromPesewas = (p: number) => (p / 100).toFixed(2);

/** Validates quantities (positive whole numbers) and merges duplicate lines. */
export function normalizeLines(raw: RawLine[]): Line[] {
  const merged = new Map<string, Line>();
  for (const l of raw) {
    const q = l.quantity;
    if (typeof q !== 'number' || !Number.isInteger(q) || q < 1) {
      throw new HttpError(400, 'Each item quantity must be a whole number of at least 1');
    }
    if (q > MAX_LINE_QTY) throw new HttpError(400, `You can order at most ${MAX_LINE_QTY} of one item`);
    const variantId = l.variantId || null;
    const key = `${l.productId}::${variantId ?? ''}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += q;
      if (existing.quantity > MAX_LINE_QTY) throw new HttpError(400, `You can order at most ${MAX_LINE_QTY} of one item`);
    } else {
      merged.set(key, { productId: l.productId, variantId, quantity: q });
    }
  }
  return [...merged.values()];
}

/** Builds the per-shop order plan from SERVER-side catalogue data only. */
export function buildPlan(lines: Line[], catalog: Map<string, CatalogProduct>, commissionPercent: number): CheckoutPlan {
  const byShop = new Map<string, PlannedShopOrder>();
  const deliveryByShop = new Map<string, number>();
  const bps = Math.round(commissionPercent * 100); // basis points

  for (const line of lines) {
    const product = catalog.get(line.productId);
    if (!product) throw new HttpError(400, 'One of the items in your cart is no longer available');

    let unit = toPesewas(product.salePrice ?? product.price);
    let available = product.stock;
    let variantName: string | null = null;

    if (product.variants.length > 0) {
      if (!line.variantId) throw new HttpError(400, `Please choose an option for "${product.name}"`);
      const v = product.variants.find((x) => x.id === line.variantId);
      if (!v) throw new HttpError(400, `The selected option for "${product.name}" is no longer available`);
      unit = toPesewas(v.salePrice ?? v.price);
      available = v.stock;
      variantName = v.name;
    } else if (line.variantId) {
      throw new HttpError(400, `"${product.name}" has no selectable options`);
    }

    if (line.quantity > available) {
      throw new HttpError(
        400,
        available <= 0
          ? `"${product.name}${variantName ? ` – ${variantName}` : ''}" is out of stock`
          : `Only ${available} of "${product.name}${variantName ? ` – ${variantName}` : ''}" left in stock`
      );
    }

    let shop = byShop.get(product.shopId);
    if (!shop) {
      shop = {
        shopId: product.shopId, shopName: product.shopName, items: [],
        itemsPesewas: 0, deliveryPesewas: 0, commissionPesewas: 0, sellerEarningsPesewas: 0, totalPesewas: 0,
      };
      byShop.set(product.shopId, shop);
      deliveryByShop.set(product.shopId, toPesewas(product.deliveryFee));
    }
    const subtotal = unit * line.quantity;
    shop.items.push({
      productId: product.id, variantId: line.variantId, productName: product.name, variantName,
      unitPesewas: unit, quantity: line.quantity, subtotalPesewas: subtotal, image: product.image,
    });
    shop.itemsPesewas += subtotal;
  }

  let items = 0, delivery = 0;
  for (const shop of byShop.values()) {
    shop.deliveryPesewas = deliveryByShop.get(shop.shopId) ?? 0;
    // commission is taken on merchandise only (not on delivery), rounded half-up to the pesewa
    shop.commissionPesewas = Math.floor((shop.itemsPesewas * bps + 5000) / 10000);
    shop.sellerEarningsPesewas = shop.itemsPesewas - shop.commissionPesewas + shop.deliveryPesewas;
    shop.totalPesewas = shop.itemsPesewas + shop.deliveryPesewas;
    items += shop.itemsPesewas;
    delivery += shop.deliveryPesewas;
  }
  return { shops: [...byShop.values()], itemsPesewas: items, deliveryPesewas: delivery, totalPesewas: items + delivery };
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no look-alike characters

/** Unguessable order number, e.g. UVM-K7Q2M9XPD4 (50 bits of entropy). */
export function newOrderNumber(): string {
  const bytes = crypto.randomBytes(10);
  let s = '';
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `UVM-${s}`;
}

/** High-entropy payment reference; doubles as the guest's order-access token. */
export function newPaymentReference(): string {
  return `PAY-${crypto.randomBytes(16).toString('hex')}`;
}
