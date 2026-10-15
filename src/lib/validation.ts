import { z } from 'zod';
import { isOwnedAssetUrl } from './storage';

/** Round to 2dp (GH₵ pesewas) and guard against float dust. */
export const money = (n: number) => Math.round(n * 100) / 100;

const trimmed = (max: number, min = 1) => z.string().trim().min(min).max(max);
const optionalText = (max: number) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), z.string().trim().max(max).optional());

const price = z.coerce.number().finite().gt(0, 'Price must be greater than 0').max(1_000_000).transform(money);
const optionalMoney = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce.number().finite().gt(0).max(1_000_000).transform(money).optional()
);
const nonNegInt = (max: number) => z.coerce.number().int().min(0).max(max);

export const assetUrl = z.string().max(600).refine(isOwnedAssetUrl, 'Image must be uploaded through the platform');

// ── Auth ────────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: trimmed(80, 2),
  email: z.string().trim().toLowerCase().max(254).email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  phone: optionalText(30),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(128),
});

// ── Merchant application ────────────────────────────────────────────────────
export const applicationSchema = z.object({
  shopName: trimmed(80, 3),
  desiredSlug: trimmed(60, 3),
  category: trimmed(80),
  description: trimmed(2000, 10),
  phone: trimmed(30, 7),
  whatsappNumber: optionalText(30),
  location: trimmed(200),
  businessRegNumber: optionalText(60),
  nationalIdNumber: optionalText(60),
  proposedDelivery: optionalText(500),
});

// ── Shop settings ───────────────────────────────────────────────────────────
export const shopPatchSchema = z
  .object({
    name: trimmed(80, 3),
    tagline: optionalText(140),
    description: optionalText(2000),
    logoUrl: z.union([assetUrl, z.literal(''), z.null()]),
    bannerUrl: z.union([assetUrl, z.literal(''), z.null()]),
    location: trimmed(200),
    phone: trimmed(30, 7),
    whatsappNumber: z.union([trimmed(30, 7), z.literal(''), z.null()]),
    themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Colour must be a hex value like #0f172a'),
    templateStyle: z.enum(['MODERN_MINIMAL', 'LUXURY_BOUTIQUE', 'MARKETPLACE_GRID', 'WARM_ARTISAN']),
    deliveryPolicy: optionalText(2000),
    returnPolicy: optionalText(2000),
    pickupAvailable: z.boolean(),
    baseDeliveryFee: z.coerce.number().finite().min(0, 'Delivery fee cannot be negative').max(10_000).transform(money),
  })
  .partial();

export const categorySchema = z.object({ name: trimmed(60, 2) });

// ── Products ────────────────────────────────────────────────────────────────
const variantSchema = z.object({
  name: trimmed(80),
  price,
  salePrice: optionalMoney,
  stock: nonNegInt(1_000_000),
  sku: optionalText(64),
});

export const productStatus = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

const productBase = z.object({
  name: trimmed(150, 2),
  description: trimmed(5000),
  price,
  salePrice: optionalMoney,
  sku: optionalText(64),
  brand: optionalText(80),
  stock: nonNegInt(1_000_000),
  lowStockThreshold: nonNegInt(10_000),
  status: productStatus,
  mallCategoryId: z.string().max(40).nullish(),
  shopCategoryId: z.string().max(40).nullish(),
  images: z
    .array(z.object({ url: assetUrl, altText: optionalText(150), isPrimary: z.boolean().optional() }))
    .max(10, 'A product can have at most 10 images'),
  variants: z.array(variantSchema).max(30),
});

export const productCreateSchema = productBase
  .partial({ salePrice: true, sku: true, brand: true, stock: true, lowStockThreshold: true, status: true, mallCategoryId: true, shopCategoryId: true, images: true, variants: true })
  .superRefine((p, ctx) => {
    if (p.salePrice !== undefined && p.salePrice >= p.price) {
      ctx.addIssue({ code: 'custom', path: ['salePrice'], message: 'Sale price must be lower than the regular price' });
    }
    for (const [i, v] of (p.variants ?? []).entries()) {
      if (v.salePrice !== undefined && v.salePrice >= v.price) {
        ctx.addIssue({ code: 'custom', path: ['variants', i, 'salePrice'], message: 'Variant sale price must be lower than its price' });
      }
    }
  });

export const productUpdateSchema = productBase.partial().extend({
  id: z.string().min(1).max(40),
  // allow explicit null to clear a sale price
  salePrice: z.union([optionalMoney, z.null()]).optional(),
});

// ── Checkout ────────────────────────────────────────────────────────────────
export const addressSchema = z.object({
  fullName: trimmed(80, 2),
  phone: z.string().trim().regex(/^[+0-9 ()-]{7,20}$/, 'Enter a valid phone number'),
  region: optionalText(60),
  city: trimmed(80, 2),
  streetAddress: optionalText(300),
  digitalAddress: optionalText(20),
  deliveryNotes: optionalText(500),
});

export const checkoutSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1).max(40), variantId: z.string().max(40).nullish(), quantity: z.unknown() })).min(1, 'Your cart is empty').max(50, 'Too many items in one order'),
  deliveryAddress: addressSchema,
  guestEmail: z.string().trim().toLowerCase().max(254).email('Enter a valid email address').optional(),
});

// ── Reviews ─────────────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  productId: z.string().min(1).max(40),
  rating: z.coerce.number().int().min(1).max(5),
  comment: trimmed(1000, 3),
});
