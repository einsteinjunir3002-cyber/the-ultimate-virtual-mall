import fs from 'node:fs';

const audit = JSON.parse(fs.readFileSync('catalog_audit_complete.json', 'utf8'));

console.log('--- TOTAL PRODUCTS:', audit.length);
const byShop = {};
for (const p of audit) {
  if (!byShop[p.shop]) byShop[p.shop] = {};
  if (!byShop[p.shop][p.category]) byShop[p.shop][p.category] = [];
  byShop[p.shop][p.category].push(p);
}

for (const [shop, cats] of Object.entries(byShop)) {
  console.log(`\n================== ${shop.toUpperCase()} ==================`);
  for (const [cat, prods] of Object.entries(cats)) {
    console.log(`\n  [Category: ${cat}] (${prods.length} items)`);
    for (const p of prods) {
      console.log(`    * ${p.name}`);
      console.log(`      File: ${p.imageFile} (${p.imageSize} bytes)`);
    }
  }
}
