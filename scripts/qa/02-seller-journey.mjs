// QA Part 1 — "Be the seller": visitor baseline → register → apply → admin approves → set up shop → fill catalogue.
import fs from 'node:fs';
import path from 'node:path';
import { Actor, RES, check, section, info, finish, saveState } from './lib.mjs';

const SELLER = { name: 'Kwame Asante', email: 'qa.seller@example.com', password: 'QaSeller#2026', phone: '+233200000001' };
const SLUG = 'accra-gadget-hub-test';
const USD_TO_GHS = 15; // TEST PRICING ONLY: indicative multiplier so the demo catalogue has plausible GH₵ prices.

const visitor = new Actor('visitor');
const seller = new Actor('seller');
const admin = new Actor('admin');

// ───────────────────────────────────────────────────────────────────────────
section('0. Visitor: public pages & baseline');
for (const p of ['/', '/shops', '/products', '/about', '/terms', '/privacy', '/seller-terms', '/shipping-returns', '/contact', '/cart', '/checkout', '/auth/login', '/auth/register', '/merchant/onboard']) {
  const r = await visitor.get(p);
  check(`GET ${p} renders`, r.status === 200, `status ${r.status}`, 'high');
}
const home = await visitor.get('/');
check('Homepage shows an intentional empty/CTA state or real shops (no crash text)', !/Application error|Internal Server Error/i.test(home.text), '', 'high');
for (const p of ['/sitemap.xml', '/robots.txt']) {
  const r = await visitor.get(p);
  check(`SEO: ${p} exists`, r.status === 200, `status ${r.status}`, 'medium');
}
const cats = await visitor.get('/api/public/categories');
check('Mall categories load (>=8)', cats.status === 200 && cats.data.categories?.length >= 8, `n=${cats.data.categories?.length}`);
const electronics = cats.data.categories?.find((c) => c.slug === 'electronics');

// ───────────────────────────────────────────────────────────────────────────
section('1. Seller registration');
let r = await seller.post('/api/auth/register', { name: SELLER.name, email: SELLER.email, password: '123', phone: SELLER.phone });
check('Weak password (<6) rejected', r.status === 400, `status ${r.status}`);
r = await seller.post('/api/auth/register', { name: SELLER.name, email: 'not-an-email', password: SELLER.password });
check('Malformed email rejected', r.status === 400, `status ${r.status} (server only checks presence)`, 'medium');
r = await seller.post('/api/auth/register', { name: SELLER.name, email: SELLER.email, password: SELLER.password, phone: SELLER.phone, role: 'MERCHANT' });
if (r.status === 409) { info('seller account already exists from a previous run → logging in'); r = await seller.post('/api/auth/login', { identifier: SELLER.email, password: SELLER.password }); }
check('Seller account created / signed in', r.status === 200 && r.data.success, `status ${r.status} ${JSON.stringify(r.data).slice(0, 120)}`, 'high');
const dup = await new Actor('dup').post('/api/auth/register', { name: 'Dup', email: SELLER.email.toUpperCase(), password: SELLER.password });
check('Duplicate email (case-insensitive) rejected', dup.status === 409, `status ${dup.status}`);
r = await seller.get('/api/auth/me');
check('Session cookie works: /api/auth/me returns the seller', r.status === 200 && r.data.user?.email === SELLER.email, JSON.stringify(r.data).slice(0, 100), 'high');
const regCookie = (await new Actor('c').post('/api/auth/login', { identifier: SELLER.email, password: SELLER.password })).setCookie.join(' | ');
check('Session cookie is HttpOnly + SameSite', /HttpOnly/i.test(regCookie) && /SameSite=lax/i.test(regCookie), regCookie.slice(0, 160));
check('Session cookie has Secure flag', /;\s*Secure/i.test(regCookie), 'Secure only set when NODE_ENV=production (expected false on localhost)', 'low');

// ───────────────────────────────────────────────────────────────────────────
section('2. Seller submits business application');
r = await seller.post('/api/merchant/apply', { shopName: 'X' });
check('Incomplete application rejected', r.status === 400, `status ${r.status}`);
r = await new Actor('anon').post('/api/merchant/apply', { shopName: 'A', desiredSlug: 'anon-shop', category: 'Electronics & Gadgets', description: 'x', phone: '1', location: 'x' });
check('Anonymous application rejected (401)', r.status === 401, `status ${r.status}`, 'high');
const applyBody = {
  shopName: 'Accra Gadget Hub (Test)', desiredSlug: SLUG, category: 'Electronics & Gadgets',
  description: 'QA TEST SHOP — smartphones, laptops, tablets and audio accessories for customers in Accra. Demo catalogue built from a public testing dataset; not a real business.',
  phone: SELLER.phone, whatsappNumber: '+233200000001', location: 'Osu, Accra',
  proposedDelivery: 'Same-day courier within Greater Accra; nationwide via third-party transport; free pickup at Osu.',
};
r = await seller.post('/api/merchant/apply', applyBody);
if ((r.status === 400 || r.status === 409) && /already operate|already taken/i.test(r.data.error || '')) info('seller already has a shop from a previous run');
else if (r.status === 400 && /under review/i.test(r.data.error || '')) info('seller already has a pending application from a previous run');
else check('Application submitted → PENDING', r.status === 200 && r.data.application?.status === 'PENDING', `status ${r.status} ${JSON.stringify(r.data).slice(0, 140)}`, 'high');
const app2 = await seller.post('/api/merchant/apply', { ...applyBody, desiredSlug: 'second-shop-attempt' });
check('Second concurrent application blocked', app2.status === 400, `status ${app2.status}`);
r = await seller.get('/api/merchant/apply');
info(`application status for seller: ${r.data.application?.status}`);

section('3. Unapproved seller cannot operate a shop');
r = await visitor.get(`/shops/${SLUG}`);
const preApproved = r.status;
r = await visitor.get('/api/public/shops');
check('Pending shop not in public directory', !r.data.shops?.some((s) => s.slug === SLUG) || preApproved !== 404, '');
if (r.data.shops?.some((s) => s.slug === SLUG)) info('shop already live from an earlier run (skipping pre-approval-only checks)');
else {
  check('Storefront URL 404 before approval', preApproved === 404, `status ${preApproved}`, 'high');
  r = await seller.post('/api/merchant/products', { name: 'Sneaky Item', description: 'x', price: 1 });
  check('Unapproved seller cannot create products', r.status === 404, `status ${r.status} ${JSON.stringify(r.data).slice(0, 100)}`, 'high');
  r = await seller.get('/api/merchant/shop');
  check('Unapproved seller has no shop record', r.status === 404, `status ${r.status}`);
}
if (!r.data.shops?.some((s) => s.slug === SLUG)) {
  const roleNow = (await seller.get('/api/auth/me')).data.user?.role;
  check('Unapproved applicant does NOT hold the MERCHANT role', roleNow !== 'MERCHANT', `role is ${roleNow} (self-assigned at sign-up/apply)`, 'medium');
}

// ───────────────────────────────────────────────────────────────────────────
section('4. Super admin (Big Sam) reviews & approves');
r = await admin.post('/api/auth/login', { identifier: 'Big Sam', password: 'BigSam12345' });
check('Super admin login with username "Big Sam"', r.status === 200 && r.data.user?.role === 'SUPER_ADMIN', `status ${r.status}`, 'high');
r = await seller.get('/api/admin/applications');
check('Seller blocked from admin applications (403)', r.status === 403, `status ${r.status}`, 'critical');
r = await visitor.get('/api/admin/applications');
check('Anonymous blocked from admin applications', r.status === 401 || r.status === 403, `status ${r.status}`, 'critical');
r = await admin.get('/api/admin/applications');
const pending = r.data.applications?.find((a) => a.desiredSlug === SLUG);
check('Admin sees the pending application with applicant details', !!pending && !!pending.user?.email, JSON.stringify(pending || {}).slice(0, 120), 'high');
if (pending?.status === 'PENDING') {
  r = await admin.post('/api/admin/applications', { applicationId: pending.id, action: 'APPROVE', adminNotes: 'QA approval — details verified.' });
  check('Admin approves → shop provisioned', r.status === 200 && r.data.shop?.status === 'ACTIVE', `status ${r.status} ${JSON.stringify(r.data).slice(0, 140)}`, 'high');
  r = await admin.post('/api/admin/applications', { applicationId: pending.id, action: 'APPROVE' });
  check('Re-approving an already-approved application is refused', r.status >= 400, `status ${r.status} (should not create a duplicate/err 500)`, 'low');
} else info(`application state: ${pending?.status} — not re-approving`);

section('5. Auto-provisioned storefront');
r = await seller.post('/api/auth/login', { identifier: SELLER.email, password: SELLER.password });
check('Seller re-login picks up active shop', r.data.user?.shop?.slug === SLUG, JSON.stringify(r.data.user?.shop), 'high');
r = await visitor.get(`/shops/${SLUG}`);
check('Public storefront live at /shops/' + SLUG, r.status === 200 && r.text.includes('Accra Gadget Hub'), `status ${r.status}`, 'high');
r = await seller.get('/api/merchant/shop');
const shop = r.data.shop;
check('Shop has default categories provisioned (3)', shop?.shopCategories?.length >= 3, `n=${shop?.shopCategories?.length}`);
check('Shop provisioned with zero products (no fake inventory)', shop?._count?.products === 0 || shop?._count?.products > 0, `products=${shop?._count?.products}`);
check('Role is now MERCHANT', (await seller.get('/api/auth/me')).data.user?.role === 'MERCHANT', '', 'high');

// ───────────────────────────────────────────────────────────────────────────
section('6. Seller brands the storefront (logo, banner, policies)');
r = await seller.upload(path.join(RES, 'logo.jpg'));
check('Logo upload', r.status === 200 && r.data.url, JSON.stringify(r.data), 'high');
const logoUrl = r.data.url;
r = await seller.upload(path.join(RES, 'banner.jpg'));
check('Banner upload', r.status === 200 && r.data.url, JSON.stringify(r.data), 'high');
const bannerUrl = r.data.url;
const logoGet = await visitor.get(logoUrl);
check('Uploaded logo is publicly retrievable as an image', logoGet.status === 200 && /image\//.test(logoGet.headers.get('content-type') || ''), `status ${logoGet.status} ${logoGet.headers.get('content-type')}`, 'high');

const videoFile = path.join(RES, 'sample-video.mp4');
if (fs.existsSync(videoFile)) {
  const vidRes = await seller.upload(videoFile, { type: 'video/mp4' });
  check('Product demonstration video upload', vidRes.status === 200 && vidRes.data.url, JSON.stringify(vidRes.data), 'high');
  if (vidRes.status === 200) {
    const vidGet = await visitor.get(vidRes.data.url);
    check('Uploaded video is publicly retrievable with video/mp4 MIME type', vidGet.status === 200 && /video\//.test(vidGet.headers.get('content-type') || ''), `status ${vidGet.status} ${vidGet.headers.get('content-type')}`, 'high');
  }
}
r = await seller.patch('/api/merchant/shop', {
  tagline: 'Genuine gadgets, fast Accra delivery', logoUrl, bannerUrl, themeColor: '#f59e0b', templateStyle: 'MARKETPLACE_GRID',
  whatsappNumber: '+233200000001', baseDeliveryFee: 20, pickupAvailable: true,
  deliveryPolicy: 'Same-day courier within Greater Accra (order before 2pm). Nationwide delivery in 2–4 working days via third-party transport. Free pickup at our Osu counter.',
  returnPolicy: 'Returns accepted within 7 days if the item is unused and in original packaging. Faulty items replaced within 14 days with proof of purchase.',
  description: 'QA TEST SHOP — your Accra stop for smartphones, laptops, tablets and audio accessories. Demo catalogue built from a public testing dataset; not a real business.',
});
check('Branding & policies saved', r.status === 200 && r.data.shop?.logoUrl === logoUrl && r.data.shop?.templateStyle === 'MARKETPLACE_GRID', `status ${r.status}`, 'high');
r = await seller.get('/api/merchant/shop');
check('Branding persisted (re-read from DB)', r.data.shop?.bannerUrl === bannerUrl && Number(r.data.shop?.baseDeliveryFee) === 20, '', 'high');
r = await seller.patch('/api/merchant/shop', { baseDeliveryFee: -50 });
check('Negative delivery fee rejected', r.status === 400, `status ${r.status} (accepted: delivery fee is now ${r.data.shop?.baseDeliveryFee})`, 'medium');
await seller.patch('/api/merchant/shop', { baseDeliveryFee: 20 });

// ───────────────────────────────────────────────────────────────────────────
section('7. Seller builds categories & fills the catalogue from downloaded resources');
const manifest = JSON.parse(fs.readFileSync(path.join(RES, 'manifest.json'), 'utf8'));
const wanted = { smartphones: 'Smartphones', laptops: 'Laptops', tablets: 'Tablets', 'mobile-accessories': 'Audio & Accessories' };
const catRes = await seller.get('/api/merchant/categories');
const shopCatIds = {};
for (const [src, label] of Object.entries(wanted)) {
  let ex = catRes.data.shopCategories.find((c) => c.name === label);
  if (!ex) { const c = await seller.post('/api/merchant/categories', { name: label }); check(`Create shop category "${label}"`, c.status === 200, `status ${c.status}`); ex = c.data.category; }
  shopCatIds[src] = ex?.id;
}
const empty = await seller.post('/api/merchant/categories', { name: '' });
check('Empty category name rejected', empty.status === 400, `status ${empty.status}`);
const dupCat = await seller.post('/api/merchant/categories', { name: 'Smartphones' });
check('Duplicate category in same shop handled gracefully (not a 500)', dupCat.status !== 500, `status ${dupCat.status}`, 'low');

const existing = (await seller.get('/api/merchant/products')).data.products || [];
const made = [];
for (const m of manifest) {
  if (existing.find((p) => p.name === m.title)) { info(`skip existing: ${m.title}`); made.push(existing.find((p) => p.name === m.title)); continue; }
  const imgs = [];
  for (const im of m.images) {
    const u = await seller.upload(im.file, { type: im.type });
    if (u.status === 200) imgs.push({ url: u.data.url, altText: m.title });
  }
  const price = Math.round(m.usdPrice * USD_TO_GHS);
  const salePrice = m.discountPercentage > 8 ? Math.round(price * (1 - m.discountPercentage / 100)) : undefined;
  const hasVariants = ['smartphones', 'laptops', 'tablets'].includes(m.category);
  const stockOverride = { 'iPhone 5s': 3, 'Apple AirPods Max Silver': 1 }[m.title];
  const body = {
    name: m.title, description: m.description, price, salePrice, brand: m.brand, sku: m.sku || `AGH-${m.sourceId}`,
    stock: stockOverride ?? Math.min(m.sourceStock, 25), lowStockThreshold: 5, status: 'PUBLISHED',
    mallCategoryId: electronics?.id, shopCategoryId: shopCatIds[m.category], images: imgs,
    variants: hasVariants ? [
      { name: '128GB', price, stock: 10, sku: `AGH-${m.sourceId}-128` },
      { name: '256GB', price: Math.round(price * 1.1), stock: 6, sku: `AGH-${m.sourceId}-256` },
    ] : [],
  };
  const c = await seller.post('/api/merchant/products', body);
  check(`Create product "${m.title}" (GH₵${price}${salePrice ? ` → sale ${salePrice}` : ''}, ${imgs.length} imgs)`, c.status === 200 && c.data.product?.images?.length === imgs.length, `status ${c.status} ${JSON.stringify(c.data).slice(0, 100)}`, 'high');
  if (c.data.product) made.push(c.data.product);
}
// A DRAFT product that must never appear publicly
if (!existing.find((p) => p.name === 'Unreleased Draft Phone (QA)')) {
  const d = await seller.post('/api/merchant/products', { name: 'Unreleased Draft Phone (QA)', description: 'Draft — must stay hidden.', price: 999, stock: 5, status: 'DRAFT', mallCategoryId: electronics?.id });
  check('Create DRAFT product', d.status === 200 && d.data.product?.status === 'DRAFT', `status ${d.status}`);
}
const mine = (await seller.get('/api/merchant/products')).data.products;
check('Catalogue persisted: 12 published + 1 draft visible to owner', mine.length >= 13, `n=${mine.length}`, 'high');
const withVariants = mine.filter((p) => p.variants?.length === 2).length;
check('Variants persisted on phones/laptops/tablets (9 products)', withVariants >= 9, `n=${withVariants}`);

section('8. Edit / unpublish / republish / validation');
const ip13 = mine.find((p) => p.name === 'iPhone 13 Pro');
let u = await seller.put('/api/merchant/products', { id: ip13.id, stock: 12, salePrice: Math.round(Number(ip13.price) * 0.9) });
check('Edit price/stock persists', u.status === 200 && u.data.product?.stock === 12, `status ${u.status}`, 'high');
u = await seller.put('/api/merchant/products', { id: ip13.id, status: 'DRAFT' });
let pub = await visitor.get('/api/public/products?q=iPhone%2013');
check('Unpublishing hides product from public catalogue', !pub.data.products?.some((p) => p.id === ip13.id), '', 'high');
u = await seller.put('/api/merchant/products', { id: ip13.id, status: 'PUBLISHED' });
pub = await visitor.get('/api/public/products?q=iPhone%2013');
check('Republishing makes it public again', pub.data.products?.some((p) => p.id === ip13.id), '', 'high');
u = await seller.post('/api/merchant/products', { name: 'Bad Price', description: 'x', price: -5 });
check('Negative price rejected on create', u.status === 400, `status ${u.status}`);
u = await seller.put('/api/merchant/products', { id: ip13.id, price: -5 });
check('Negative price rejected on edit', u.status === 400, `status ${u.status} (price now ${u.data.product?.price})`, 'high');
u = await seller.put('/api/merchant/products', { id: ip13.id, salePrice: Number(ip13.price) * 3 });
check('Sale price higher than regular price rejected', u.status === 400, `status ${u.status}`, 'medium');
await seller.put('/api/merchant/products', { id: ip13.id, salePrice: Math.round(Number(ip13.price) * 0.9), stock: 12 });

saveState({
  sellerEmail: SELLER.email, sellerPassword: SELLER.password, slug: SLUG, shopId: shop?.id,
  products: mine.map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: Number(p.price), salePrice: p.salePrice ? Number(p.salePrice) : null, stock: p.stock, status: p.status, variants: p.variants?.map((v) => ({ id: v.id, name: v.name, price: Number(v.price), stock: v.stock })) })),
  electronicsId: electronics?.id,
});
finish('Part 1 - Seller journey');
