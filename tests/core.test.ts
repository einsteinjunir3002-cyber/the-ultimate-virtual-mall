import test from 'node:test';
import assert from 'node:assert/strict';
import { detectMediaType, isOwnedAssetUrl } from '../src/lib/storage';
import { normalizeLines, buildPlan, newOrderNumber, newPaymentReference, type CatalogProduct } from '../src/lib/checkout';
import { verifyPaystackWebhookSignature } from '../src/lib/paystack';
import { calculateSellerSplit, formatGhs } from '../src/lib/commission';

test('detectMediaType: identifies genuine image and video magic numbers', () => {
  // JPG: FF D8 FF
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  assert.equal(detectMediaType(jpg), 'jpg');

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(detectMediaType(png), 'png');

  // WEBP: RIFF ... WEBP
  const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  assert.equal(detectMediaType(webp), 'webp');

  // GIF: GIF89a
  const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  assert.equal(detectMediaType(gif), 'gif');

  // MP4: offset 4-7 is 'ftyp'
  const mp4 = new Uint8Array([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
  assert.equal(detectMediaType(mp4), 'mp4');

  // WebM: 1A 45 DF A3
  const webm = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42]);
  assert.equal(detectMediaType(webm), 'webm');

  // Invalid / HTML / script
  const html = Buffer.from('<script>alert(1)</script>');
  assert.equal(detectMediaType(html), null);

  const fakePng = Buffer.from('this is just text disguised as png');
  assert.equal(detectMediaType(fakePng), null);
});

test('isOwnedAssetUrl: accepts only genuine platform asset paths', () => {
  assert.equal(isOwnedAssetUrl('/uploads/img-1792081927446-71mg34.jpg'), true);
  assert.equal(isOwnedAssetUrl('/uploads/media-1792081927446-71mg34.mp4'), true);
  assert.equal(isOwnedAssetUrl('/uploads/media-1792081927446-71mg34.webm'), true);

  // Rejected URLs
  assert.equal(isOwnedAssetUrl('/uploads/malicious.html'), false);
  assert.equal(isOwnedAssetUrl('https://evil.com/phishing.jpg'), false);
  assert.equal(isOwnedAssetUrl('/etc/passwd'), false);
  assert.equal(isOwnedAssetUrl('javascript:alert(1)'), false);
});

test('checkout: normalizeLines validates quantities and merges duplicate items', () => {
  const merged = normalizeLines([
    { productId: 'p1', variantId: 'v1', quantity: 2 },
    { productId: 'p1', variantId: 'v1', quantity: 3 },
    { productId: 'p2', quantity: 1 },
  ]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].quantity, 5);
  assert.equal(merged[1].quantity, 1);

  // Rejects invalid quantities
  assert.throws(() => normalizeLines([{ productId: 'p1', quantity: 0 }]));
  assert.throws(() => normalizeLines([{ productId: 'p1', quantity: -5 }]));
  assert.throws(() => normalizeLines([{ productId: 'p1', quantity: 1.5 }]));
  assert.throws(() => normalizeLines([{ productId: 'p1', quantity: 99999 }]));
});

test('checkout: buildPlan calculates accurate subtotal, delivery and commission in pesewas', () => {
  const catalog = new Map<string, CatalogProduct>();
  catalog.set('prod-1', {
    id: 'prod-1',
    name: 'Test Phone',
    shopId: 'shop-1',
    shopName: 'Shop One',
    price: 1000,
    salePrice: null,
    stock: 10,
    deliveryFee: 20,
    image: null,
    variants: [
      { id: 'var-1', name: '256GB', price: 1200, salePrice: null, stock: 5 },
    ],
  });
  catalog.set('prod-2', {
    id: 'prod-2',
    name: 'Phone Case',
    shopId: 'shop-1',
    shopName: 'Shop One',
    price: 50,
    salePrice: 40,
    stock: 20,
    deliveryFee: 20,
    image: null,
    variants: [],
  });

  const lines = [
    { productId: 'prod-1', variantId: 'var-1', quantity: 2 },
    { productId: 'prod-2', variantId: null, quantity: 1 },
  ];

  const plan = buildPlan(lines, catalog, 5.0); // 5%

  // Items: 2 * 1200 = 2400 GHS (240,000 pesewas) + 1 * 40 = 40 GHS (4,000 pesewas) = 244,000 pesewas
  assert.equal(plan.itemsPesewas, 244000);
  // Single shop delivery fee: 20 GHS = 2,000 pesewas
  assert.equal(plan.deliveryPesewas, 2000);
  // Total: 246,000 pesewas
  assert.equal(plan.totalPesewas, 246000);
  // Commission on items: 5% of 2440 GHS = 122 GHS (12,200 pesewas)
  assert.equal(plan.shops[0].commissionPesewas, 12200);
  // Net to merchant: 2440 - 122 + 20 delivery = 2338 GHS (233,800 pesewas)
  assert.equal(plan.shops[0].sellerEarningsPesewas, 233800);
});

test('checkout: generators create high-entropy order numbers and references', () => {
  const orderNum1 = newOrderNumber();
  const orderNum2 = newOrderNumber();
  assert.match(orderNum1, /^UVM-[A-Z0-9]{10}$/);
  assert.notEqual(orderNum1, orderNum2);

  const ref1 = newPaymentReference();
  const ref2 = newPaymentReference();
  assert.match(ref1, /^PAY-[a-f0-9]{32}$/);
  assert.notEqual(ref1, ref2);
});

test('paystack: verifyPaystackWebhookSignature uses timing-safe HMAC verification', () => {
  const crypto = require('node:crypto');
  const secret = 'sk_test_mock_secret_key_12345';
  process.env.PAYSTACK_SECRET_KEY = secret;

  const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: 'PAY-123' } });
  const validSignature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

  assert.equal(verifyPaystackWebhookSignature(rawBody, validSignature), true);
  assert.equal(verifyPaystackWebhookSignature(rawBody, 'invalid_forged_signature'), false);
  assert.equal(verifyPaystackWebhookSignature(rawBody, null), false);
});

test('commission: calculateSellerSplit and formatGhs', () => {
  const res = calculateSellerSplit(150, 0, 5);
  assert.equal(res.commissionAmount, 7.5);
  assert.equal(res.sellerEarnings, 142.5);

  assert.equal(formatGhs(100), 'GH₵ 100.00');
  assert.equal(formatGhs(99.9), 'GH₵ 99.90');
});
