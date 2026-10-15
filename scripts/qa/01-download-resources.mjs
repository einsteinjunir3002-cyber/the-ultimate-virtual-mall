// QA helper: downloads TEST product data + images for the QA demo shop.
// Source: https://dummyjson.com (a free testing API). These are test assets only,
// NOT suitable for a real merchant launch (brand names / image rights are not cleared).
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('qa-resources');
const IMG = path.join(OUT, 'images');
fs.mkdirSync(IMG, { recursive: true });

const PICK = { smartphones: 3, laptops: 3, 'mobile-accessories': 3, tablets: 3 };
const manifest = [];

for (const [category, count] of Object.entries(PICK)) {
  const res = await fetch(`https://dummyjson.com/products/category/${category}?limit=${count}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category}: ${res.status}`);
  const { products } = await res.json();

  for (const p of products) {
    const images = [];
    const urls = (p.images && p.images.length ? p.images : [p.thumbnail]).slice(0, 3);
    for (let i = 0; i < urls.length; i++) {
      const r = await fetch(urls[i]);
      if (!r.ok) { console.warn('  skip image', urls[i], r.status); continue; }
      const type = (r.headers.get('content-type') || 'image/png').split(';')[0];
      const ext = type.includes('webp') ? 'webp' : type.includes('jpeg') ? 'jpg' : type.includes('gif') ? 'gif' : 'png';
      const file = path.join(IMG, `p${p.id}-${i + 1}.${ext}`);
      fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
      images.push({ file, type, bytes: fs.statSync(file).size });
    }
    manifest.push({
      sourceId: p.id,
      category,
      title: p.title,
      description: p.description,
      brand: p.brand || null,
      sku: p.sku || null,
      usdPrice: p.price,
      discountPercentage: p.discountPercentage,
      sourceStock: p.stock,
      images,
    });
    console.log(`✓ ${category.padEnd(18)} ${p.title} (${images.length} images)`);
  }
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
const bytes = manifest.flatMap((m) => m.images).reduce((s, i) => s + i.bytes, 0);
console.log(`\nDownloaded ${manifest.length} products, ${manifest.flatMap((m) => m.images).length} images, ${(bytes / 1024).toFixed(0)} KB -> ${OUT}`);
