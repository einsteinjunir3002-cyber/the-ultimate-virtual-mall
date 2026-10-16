import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const catalog = JSON.parse(fs.readFileSync('flawless_catalog.json', 'utf8'));
const hashes = {};
for (const item of catalog) {
  const filePath = path.join('public/uploads', item.image.replace('/uploads/', ''));
  const buf = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  if (!hashes[hash]) hashes[hash] = [];
  hashes[hash].push({ name: item.name, shop: item.shop, file: item.image });
}

let dupes = 0;
for (const [h, list] of Object.entries(hashes)) {
  if (list.length > 1) {
    console.log(`DUPLICATE (${list.length} products share hash ${h}):`);
    for (const p of list) {
      console.log(`  - [${p.shop}] ${p.name} -> ${p.file}`);
    }
    dupes += list.length;
  }
}
console.log('Total products sharing identical image hash:', dupes);
