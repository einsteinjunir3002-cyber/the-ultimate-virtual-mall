import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dir = 'public/uploads';
const files = fs.readdirSync(dir).filter(f => f.startsWith('prod-uniq-') && f.endsWith('.webp'));
const hashes = {};
for (const f of files) {
  const buf = fs.readFileSync(path.join(dir, f));
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  if (!hashes[hash]) hashes[hash] = [];
  hashes[hash].push(f);
}
let dupes = 0;
for (const [h, list] of Object.entries(hashes)) {
  if (list.length > 1) {
    console.log(`Duplicate hash ${h} (${list.length} files):`, list);
    dupes += list.length;
  }
}
console.log('Total files examined:', files.length, 'Total files involved in duplicates:', dupes);
