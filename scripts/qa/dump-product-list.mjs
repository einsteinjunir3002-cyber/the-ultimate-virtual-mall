import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function run() {
  const products = await p.product.findMany({
    include: {
      shop: { select: { name: true, slug: true } },
      shopCategory: { select: { name: true, slug: true } },
      images: { orderBy: { displayOrder: 'asc' } },
    },
    orderBy: [
      { shop: { name: 'asc' } },
      { shopCategory: { name: 'asc' } },
      { name: 'asc' },
    ],
  });

  const list = products.map((prod, idx) => ({
    index: idx + 1,
    id: prod.id,
    shop: prod.shop.name,
    shopSlug: prod.shop.slug,
    category: prod.shopCategory?.name || '',
    name: prod.name,
    slug: prod.slug,
    price: Number(prod.price),
    description: prod.description,
    image: prod.images[0]?.url || '',
  }));

  fs.writeFileSync('all_products_audit.json', JSON.stringify(list, null, 2), 'utf-8');
  console.log(`Audited ${list.length} products to all_products_audit.json`);
  await p.$disconnect();
}

run().catch(console.error);
