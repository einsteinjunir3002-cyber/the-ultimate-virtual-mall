import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function run() {
  const shops = await p.shop.findMany({
    include: {
      shopCategories: {
        include: {
          products: {
            include: { images: true, variants: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const catalog = [];
  for (const s of shops) {
    const shopData = {
      name: s.name,
      slug: s.slug,
      categories: [],
    };
    for (const c of s.shopCategories) {
      const catData = {
        name: c.name,
        slug: c.slug,
        products: c.products.map((prod) => ({
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          price: prod.price,
          description: prod.description,
          specs: prod.specs,
          imageUrl: prod.images[0]?.url || '',
        })),
      };
      shopData.categories.push(catData);
    }
    catalog.push(shopData);
  }

  fs.writeFileSync('current_catalog.json', JSON.stringify(catalog, null, 2), 'utf-8');
  console.log('Saved current_catalog.json in UTF-8');
  await p.$disconnect();
}

run().catch(console.error);
