import fs from 'node:fs';

const audit = JSON.parse(fs.readFileSync('catalog_audit_complete.json', 'utf8'));
const targetFiles = [
  'prod-uniq-1549887534-1541e9326642.webp',
  'prod-uniq-1609592426868-b7eb478bbd23.webp',
  'prod-uniq-1511707171634-5f897ff02560.webp',
  'img-1792081927736-x9lg4x.webp',
  'prod-uniq-1544787219-7f47ccb76575.webp',
  'prod-uniq-1576092768242-dec231879fc4.webp',
  'prod-uniq-1536591375315-1b83683e321c.webp',
  'prod-uniq-1607006314644-b0a1f298818c.webp',
  'prod-uniq-1567928805192-7ff4c28001a1.webp',
  'prod-uniq-1512290900672-1f416ba38814.webp',
  'prod-uniq-1608248597359-0021b37d5718.webp',
  'prod-uniq-1553062407-98eeb64c6a63.webp',
  'prod-uniq-1570535608479-2a994a32c28e.webp',
  'prod-uniq-1621996346565-e3d5d628178d.webp',
  'prod-uniq-1514944298352-78d123dbf075.webp',
  'prod-uniq-1579783902614-a3fb3927b675.webp',
  'prod-uniq-1607344645866-009c320c5ab8.webp',
  'prod-uniq-1517256064527-09c73fc73e38.webp',
  'prod-uniq-1556881286-fc6915169721.webp',
  'prod-uniq-1507679799987-c73779587ccf.webp',
  'prod-uniq-1518611012118-696072aa579a.webp',
  'prod-uniq-1506126613408-eca07ce68773.webp',
  'prod-uniq-1581009146145-b5ef050c2e1e.webp',
  'prod-uniq-1548883354-7622d03aca27.webp',
  'prod-uniq-1583454110551-21f2fa2afe61.webp',
  'prod-uniq-1517838277536-f5f99be501cd.webp',
  'prod-uniq-1574680096145-d05b474e2155.webp',
  'prod-uniq-1584735935682-2f2b69dff9d2.webp',
  'prod-uniq-1598289431512-b97b0917affc.webp',
  'prod-uniq-1622560480605-d83c853bc5c3.webp',
  'prod-uniq-1589756823695-278bc923f962.webp',
  'prod-uniq-1594938298603-c8148c4dae35.webp',
  'prod-uniq-1560769629-975ec94e6a86.webp',
  'prod-uniq-1543163521-1bf539c55dd2.webp'
];

for (const p of audit) {
  if (targetFiles.includes(p.imageFile)) {
    console.log(`ID: "${p.id}" | Slug: "${p.slug}" | Name: "${p.name}" | Img: "${p.imageFile}"`);
  }
}
