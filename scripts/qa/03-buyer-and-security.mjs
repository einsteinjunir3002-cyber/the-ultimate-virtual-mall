// QA Part 2 — "Be the buyer" (browse/search/cart-validation) + security & tenant-isolation probes.
import { SignJWT } from 'jose';
import fs from 'node:fs';
import path from 'node:path';
import { Actor, RES, check, section, info, finish, loadState, saveState } from './lib.mjs';

const st = loadState();
const SLUG = st.slug;
const P = Object.fromEntries((st.products || []).map((p) => [p.name, p]));
const BUYER = { name: 'Ama Boateng', email: 'qa.buyer@example.com', password: 'QaBuyer#2026', phone: '+233200000002' };
const RIVAL = { name: 'Rival Trader', email: 'qa.rival@example.com', password: 'QaRival#2026' };

const visitor = new Actor('visitor');
const buyer = new Actor('buyer');
const seller = new Actor('seller');
const rival = new Actor('rival');
const admin = new Actor('admin');
const ghs = (n) => Number(n);

await seller.post('/api/auth/login', { identifier: st.sellerEmail, password: st.sellerPassword });
await admin.post('/api/auth/login', { identifier: 'Big Sam', password: 'BigSam12345' });

// ───────────────────────────────────────────────────────────────────────────
section('9. Buyer discovers the shop (no account needed)');
let r = await visitor.get('/api/public/shops');
const listed = r.data.shops?.find((s) => s.slug === SLUG);
check('Shop appears in mall directory with correct published-product count (12)', listed?._count?.products === 12, `count=${listed?._count?.products}`, 'high');
r = await visitor.get(`/api/public/shops/${SLUG}`);
check('Shop detail API works', r.status === 200, `status ${r.status}`);
r = await visitor.get('/api/public/products');
const all = r.data.products || [];
check('Mall catalogue lists 12 published products (draft excluded)', all.filter((p) => p.shop?.slug === SLUG).length === 12 && !all.some((p) => p.name.includes('Draft')), `n=${all.length}`, 'high');
check('Every listed product has images', all.filter((p) => p.shop?.slug === SLUG).every((p) => p.images?.length > 0), '');
r = await visitor.get('/api/public/products?q=ipad');
check('Search "ipad" finds the iPad', r.data.products?.some((p) => p.name.includes('iPad')), `n=${r.data.products?.length}`, 'high');
r = await visitor.get('/api/public/products?q=zzzznotfound');
check('Search with no match → empty list', r.status === 200 && r.data.products?.length === 0);
r = await visitor.get('/api/public/products?sort=price-asc');
let prices = r.data.products.map((p) => ghs(p.price));
check('Sort price ascending is correct', prices.every((v, i) => i === 0 || prices[i - 1] <= v), prices.join(','));
r = await visitor.get('/api/public/products?sort=price-desc');
prices = r.data.products.map((p) => ghs(p.price));
check('Sort price descending is correct', prices.every((v, i) => i === 0 || prices[i - 1] >= v));
r = await visitor.get('/api/public/products?minPrice=5000&maxPrice=10000');
const band = r.data.products.map((p) => ghs(p.price));
check('Price band filter (min 5000 AND max 10000) honours both bounds', band.length > 0 && band.every((v) => v >= 5000 && v <= 10000), `got prices: ${band.join(',')}`, 'medium');
r = await visitor.get(`/api/public/products?category=electronics`);
check('Mall-category filter (electronics) returns the shop products', r.data.products?.length >= 12, `n=${r.data.products?.length}`);
r = await visitor.get(`/api/public/products?shop=${SLUG}`);
check('Filter by shop works', r.data.products?.length === 12);
const ipad = P['iPad Mini 2021 Starlight'];
r = await visitor.get(`/api/public/products/${ipad.slug}`);
check('Product detail by slug', r.status === 200 && r.data.product?.variants?.length === 2, `status ${r.status}`, 'high');
check('Product detail returns related products', r.data.relatedProducts?.length > 0, '');
check('Related products are real catalogue items (none is the same product)', r.data.relatedProducts?.every((x) => x.id !== ipad.id), '');
const draft = (await seller.get('/api/merchant/products')).data.products.find((p) => p.status === 'DRAFT');
r = await visitor.get(`/api/public/products/${draft.slug}`);
check('Draft product detail is 404 to the public', r.status === 404, `status ${r.status}`, 'high');

section('10. SEO & server-rendered content (what search engines see)');
r = await visitor.get(`/shops/${SLUG}`);
check('Storefront HTML contains product names (SSR)', r.text.includes('iPad Mini 2021 Starlight'), '', 'high');
const title = (t) => (t.match(/<title>([^<]*)<\/title>/) || [])[1];
const tShop = title(r.text); const tHome = title((await visitor.get('/')).text);
check('Storefront has its own <title> (not the generic mall title)', tShop && tShop !== tHome, `shop="${tShop}" home="${tHome}"`, 'medium');
check('Storefront has meta description', /<meta name="description"/.test(r.text), '', 'low');
r = await visitor.get(`/products/${ipad.slug}`);
check('Product page HTML contains the product name (SSR for SEO)', r.text.includes('iPad Mini 2021 Starlight'), 'product page is a client component → crawlers see an empty shell', 'high');
check('Product page has Product JSON-LD structured data', /application\/ld\+json/.test(r.text) && /"@type":"Product"/.test(r.text), '', 'medium');
check('Product page has a unique <title>', title(r.text) && title(r.text) !== tHome, `title="${title(r.text)}"`, 'medium');
check('Product page has canonical + Open Graph tags', /rel="canonical"/.test(r.text) && /og:title/.test(r.text), '', 'medium');
for (const p of ['/account', '/cart', '/checkout', '/merchant/dashboard', '/admin']) {
  const x = await visitor.get(p);
  check(`Private page ${p} is noindex`, /noindex/i.test(x.text) || /noindex/i.test(x.headers.get('x-robots-tag') || ''), '', 'medium');
}
r = await visitor.get('/');
const hdr = r.headers;
check('Security headers present (X-Content-Type-Options, X-Frame-Options/CSP)', hdr.get('x-content-type-options') && (hdr.get('x-frame-options') || hdr.get('content-security-policy')), `nosniff=${hdr.get('x-content-type-options')} xfo=${hdr.get('x-frame-options')} csp=${hdr.get('content-security-policy')}`, 'medium');

section('11. Buyer account');
r = await buyer.post('/api/auth/register', { name: BUYER.name, email: BUYER.email, password: BUYER.password, phone: BUYER.phone, role: 'CUSTOMER' });
if (r.status === 409) r = await buyer.post('/api/auth/login', { identifier: BUYER.email, password: BUYER.password });
check('Buyer account created / signed in', r.status === 200 && r.data.user?.role === 'CUSTOMER', `status ${r.status}`, 'high');
const esc = await new Actor('esc').post('/api/auth/register', { name: 'Evil', email: `evil.${Date.now()}@example.com`, password: 'Evil#12345', role: 'SUPER_ADMIN' });
check('Cannot self-register as SUPER_ADMIN', esc.data.user?.role !== 'SUPER_ADMIN', `role=${esc.data.user?.role}`, 'critical');
check('Cannot self-register as MERCHANT (needs approval)', esc.data.user?.role === 'CUSTOMER', `role=${esc.data.user?.role}`, 'medium');
r = await buyer.get('/api/merchant/products');
check('Buyer blocked from merchant API', r.status === 403 || r.status === 401, `status ${r.status}`, 'high');
r = await buyer.get('/api/admin/stats');
check('Buyer blocked from admin API', r.status === 403 || r.status === 401, `status ${r.status}`, 'critical');

section('12. Checkout validation (server must reject bad carts BEFORE any payment is started)');
const addr = { fullName: 'Ama Boateng', phone: '0200000002', city: 'Accra', region: 'Greater Accra', streetAddress: 'Near the Osu Oxford Street junction, behind the pharmacy (no street number)' };
const item = (p, q, extra = {}) => ({ productId: p.id, name: p.name, quantity: q, price: p.price, ...extra });
const co = (items, o = {}) => buyer.post('/api/checkout', { items, deliveryAddress: addr, ...o });
const expect400 = (name, res, sev = 'high') => check(name, res.status === 400, `status ${res.status} ${JSON.stringify(res.data).slice(0, 110)}`, sev);
expect400('Empty cart rejected', await co([]));
expect400('Missing delivery address rejected', await buyer.post('/api/checkout', { items: [item(ipad, 1)] }));
expect400('Guest without email rejected', await new Actor('g').post('/api/checkout', { items: [item(ipad, 1)], deliveryAddress: addr }));
expect400('Unknown product rejected', await co([{ productId: 'does-not-exist', name: 'ghost', quantity: 1 }]));
expect400('Draft product cannot be bought', await co([item({ ...draft, price: 999 }, 1)]));
expect400('Over-stock quantity rejected (AirPods Max has 1)', await co([item(P['Apple AirPods Max Silver'], 2)]));
expect400('Quantity 0 rejected', await co([item(ipad, 0)]), 'high');
expect400('Negative quantity rejected', await co([item(ipad, -3)]), 'critical');
expect400('Negative-quantity line cannot offset a real line (price manipulation)', await co([item(P['iPhone 6'], 1), item(P['iPhone 13 Pro'], -5)]), 'critical');
expect400('Fractional quantity rejected', await co([item(ipad, 1.5)]), 'high');
expect400('Non-numeric quantity rejected', await co([item(ipad, 'abc')]), 'high');
expect400('Duplicate lines cannot bypass stock (2 × qty1 of a 1-stock item)', await co([item(P['Apple AirPods Max Silver'], 1), item(P['Apple AirPods Max Silver'], 1)]), 'high');
expect400('Absurd quantity (1e9) rejected', await co([item(ipad, 1e9)]));
const pay = await co([item(ipad, 1, { variantId: ipad.variants[0]?.id })]);
info(`valid cart → status ${pay.status}: ${JSON.stringify(pay.data).slice(0, 200)}`);
check('Valid cart reaches real Paystack initialisation (gets a payment URL OR a clear provider error)', pay.status === 200 || /key|paystack|payment/i.test(JSON.stringify(pay.data)), JSON.stringify(pay.data).slice(0, 160), 'high');
saveState({ paymentInit: { status: pay.status, body: pay.data } });

section('13. Payment endpoints reject forged/invalid input');
r = await new Actor('p').post('/api/webhooks/paystack', { event: 'charge.success', data: { reference: 'x' } });
check('Webhook without signature rejected (400)', r.status === 400, `status ${r.status}`, 'critical');
r = await new Actor('p').post('/api/webhooks/paystack', { event: 'charge.success', data: { reference: 'x' } }, { headers: { 'x-paystack-signature': 'a'.repeat(128) } });
check('Webhook with forged signature rejected', r.status === 400, `status ${r.status}`, 'critical');
r = await visitor.get('/api/payments/verify');
check('Verify without reference → 400', r.status === 400, `status ${r.status}`);
r = await visitor.get('/api/payments/verify?reference=PAY-DOES-NOT-EXIST&test_mode=true');
check('Verify with unknown reference + test_mode flag → 404 (no free "success")', r.status === 404, `status ${r.status}`, 'critical');

// ───────────────────────────────────────────────────────────────────────────
section('14. Tenant isolation: a second merchant tries to touch the first merchant\'s data');
r = await rival.post('/api/auth/register', { name: RIVAL.name, email: RIVAL.email, password: RIVAL.password });
if (r.status === 409) await rival.post('/api/auth/login', { identifier: RIVAL.email, password: RIVAL.password });
await rival.post('/api/merchant/apply', { shopName: 'QA Rival Temp Shop', desiredSlug: 'qa-rival-temp-shop', category: 'Electronics & Gadgets', description: 'Temporary rival shop used to test tenant isolation. Deleted after the test run.', phone: '+233200000003', location: 'Kumasi' });
const apps = (await admin.get('/api/admin/applications')).data.applications;
const rapp = apps.find((a) => a.desiredSlug === 'qa-rival-temp-shop');
if (rapp?.status === 'PENDING') await admin.post('/api/admin/applications', { applicationId: rapp.id, action: 'APPROVE' });
await rival.post('/api/auth/login', { identifier: RIVAL.email, password: RIVAL.password });
const rshop = (await rival.get('/api/merchant/shop')).data.shop;
check('Rival has their own approved shop', !!rshop, '', 'high');
const target = P['iPhone 6'];
r = await rival.put('/api/merchant/products', { id: target.id, price: 1 });
check('Rival cannot EDIT another shop\'s product (403)', r.status === 403, `status ${r.status}`, 'critical');
r = await rival.put('/api/merchant/products', { id: target.id, status: 'ARCHIVED', stock: 0 });
check('Rival cannot unpublish / zero-stock another shop\'s product', r.status === 403, `status ${r.status}`, 'critical');
r = await rival.del(`/api/merchant/products?id=${target.id}`);
check('Rival cannot DELETE another shop\'s product (403)', r.status === 403, `status ${r.status}`, 'critical');
const after = (await seller.get('/api/merchant/products')).data.products.find((p) => p.id === target.id);
check('Victim product is unchanged after the attacks', Number(after.price) === target.price && after.status === 'PUBLISHED', JSON.stringify({ price: after.price, status: after.status }), 'critical');
r = await rival.get('/api/merchant/products');
check('Rival\'s product list contains none of the victim\'s products', !r.data.products?.some((p) => p.shopId === st.shopId), '', 'critical');
r = await rival.get('/api/merchant/orders');
check('Rival\'s order list is scoped to their own shop', r.status === 200 && (r.data.orders || []).every((o) => o.shopId !== st.shopId), '', 'critical');
r = await rival.patch('/api/merchant/orders', { orderId: 'some-other-shop-order-id', status: 'DELIVERED' });
check('Rival cannot update an order they do not own (403)', r.status === 403, `status ${r.status}`, 'critical');
r = await rival.patch('/api/merchant/shop', { status: 'SUSPENDED', ownerId: 'x', isFeatured: true, rating: 5 });
const rs2 = (await rival.get('/api/merchant/shop')).data.shop;
check('Mass-assignment blocked (cannot self-feature / change status / rating)', rs2.isFeatured === false && rs2.status === 'ACTIVE' && Number(rs2.rating) === 0, JSON.stringify({ f: rs2.isFeatured, s: rs2.status, r: rs2.rating }), 'high');
const dupName = await rival.post('/api/merchant/products', { name: 'iPhone 6', description: 'Rival listing with same name', price: 100, stock: 1, mallCategoryId: st.electronicsId });
check('Two shops can list the same product name', dupName.status === 200, `status ${dupName.status}`);
if (dupName.data.product) {
  const a = await visitor.get(`/api/public/products/${dupName.data.product.slug}`);
  check('Public product URL is unambiguous when two shops use the same product name', dupName.data.product.slug !== target.slug && a.data.product?.id === dupName.data.product.id, `slug "${target.slug}" vs "${dupName.data.product.slug}"`, 'medium');
}
saveState({ rivalShopId: rshop?.id, rivalSlug: 'qa-rival-temp-shop' });

section('15. Authentication & session hardening');
const secrets = ['the_ultimate_virtual_mall_default_jwt_secret_key_2026', 'secret', 'changeme'];
for (const s of secrets) {
  const forged = await new SignJWT({ userId: 'x', email: 'bigsam@theultimatemall.com', name: 'Big Sam', role: 'SUPER_ADMIN' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h').sign(new TextEncoder().encode(s));
  const f = new Actor('forger'); f.cookies.set('mall_session_token', forged);
  const x = await f.get('/api/admin/applications');
  check(`JWT forged with guessable secret "${s.slice(0, 24)}…" is rejected`, x.status !== 200, `status ${x.status}`, 'critical');
}
const t = new Actor('t'); t.cookies.set('mall_session_token', 'garbage.token.value');
check('Tampered session cookie → treated as signed out', (await t.get('/api/auth/me')).data.user == null, '');
let codes = [];
for (let i = 0; i < 25; i++) codes.push((await new Actor('bf').post('/api/auth/login', { identifier: 'qa.bruteforce@example.com', password: 'wrong-' + i })).status);
check('Brute-force protection: repeated bad logins are throttled (429)', codes.includes(429), `25 wrong attempts → statuses: ${[...new Set(codes)].join(',')} (no throttling/lockout)`, 'high');
await buyer.post('/api/auth/logout');
check('Logout clears the session', (await buyer.get('/api/auth/me')).data.user == null, '');
r = await visitor.get('/api/admin/config');
check('Admin config endpoint is not publicly readable', r.status === 401 || r.status === 403, `status ${r.status} (exposes: ${Object.keys(r.data.config || {}).join(',')})`, 'low');
r = await visitor.post('/api/auth/login', { identifier: { $ne: '' }, password: { $ne: '' } });
check('Login rejects object/NoSQL-style payloads without a 500', r.status === 400 || r.status === 401, `status ${r.status}`, 'low');

section('16. File upload hardening');
const png = path.join(RES, 'images', fs.readdirSync(path.join(RES, 'images')).find((f) => f.endsWith('.png') || f.endsWith('.webp')));
r = await new Actor('anon').upload(png);
check('Anonymous upload rejected', r.status === 401 || r.status === 403, `status ${r.status}`, 'high');
const buyer2 = new Actor('b2'); await buyer2.post('/api/auth/login', { identifier: BUYER.email, password: BUYER.password });
r = await buyer2.upload(png);
check('Plain customer cannot upload files (merchants/admin only)', r.status === 401 || r.status === 403, `status ${r.status}`, 'medium');
const evil = path.join(RES, 'evil.html'); fs.writeFileSync(evil, '<script>alert(document.domain)</script>');
r = await seller.upload(evil, { type: 'image/png', filename: 'evil.html' });
check('HTML payload disguised as image/png is rejected', r.status === 400, `status ${r.status} url=${r.data.url} (stored with attacker-chosen extension)`, 'critical');
const fake = path.join(RES, 'notanimage.png'); fs.writeFileSync(fake, 'this is plain text, not an image');
r = await seller.upload(fake, { type: 'image/png' });
check('Non-image bytes with image MIME rejected (magic-byte check)', r.status === 400, `status ${r.status}`, 'high');
const big = path.join(RES, 'big.png'); fs.writeFileSync(big, Buffer.alloc(12 * 1024 * 1024, 1));
r = await seller.upload(big, { type: 'image/png' });
check('Oversize (12MB) upload rejected', r.status === 400, `status ${r.status}`);
fs.rmSync(evil, { force: true }); fs.rmSync(fake, { force: true }); fs.rmSync(big, { force: true });
r = await seller.upload(png);
check('Valid product image is retrievable after upload (persistent + served)', r.status === 200 && (await visitor.get(r.data.url)).status === 200, `url=${r.data.url} → ${(await visitor.get(r.data.url)).status}`, 'high');

finish('Part 2 - Buyer and security');
