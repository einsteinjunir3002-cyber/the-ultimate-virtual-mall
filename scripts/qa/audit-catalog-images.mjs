import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const prods = await p.product.findMany({
    include: {
      shop: { select: { id: true, name: true, slug: true } },
      shopCategory: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { displayOrder: 'asc' } }
    },
    orderBy: [
      { shop: { name: 'asc' } },
      { shopCategory: { name: 'asc' } },
      { name: 'asc' }
    ]
  });

  const catalog = [];
  for (const pr of prods) {
    const imgUrl = pr.images[0]?.url || '';
    const imgFile = imgUrl.replace('/uploads/', '');
    const fullPath = path.join('public/uploads', imgFile);
    let size = 0;
    let exists = false;
    if (fs.existsSync(fullPath)) {
      exists = true;
      size = fs.statSync(fullPath).size;
    }
    catalog.push({
      id: pr.id,
      shop: pr.shop.name,
      shopSlug: pr.shop.slug,
      category: pr.shopCategory?.name,
      categorySlug: pr.shopCategory?.slug,
      name: pr.name,
      slug: pr.slug,
      price: Number(pr.price),
      description: pr.description,
      imageUrl: imgUrl,
      imageFile: imgFile,
      imageExists: exists,
      imageSize: size
    });
  }

  fs.writeFileSync('catalog_audit_complete.json', JSON.stringify(catalog, null, 2));
  console.log(`Audited ${catalog.length} products to catalog_audit_complete.json`);
}

main().finally(() => p.$disconnect());
