import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const prods = await p.product.findMany({
    include: {
      shop: true,
      shopCategory: true,
      images: true,
    },
    orderBy: [{ shop: { name: 'asc' } }, { shopCategory: { name: 'asc' } }, { name: 'asc' }]
  });
  console.log('Total products:', prods.length);
  const data = prods.map(pr => ({
    id: pr.id,
    shop: pr.shop.name,
    shopSlug: pr.shop.slug,
    category: pr.shopCategory?.name,
    categorySlug: pr.shopCategory?.slug,
    name: pr.name,
    description: pr.description,
    image: pr.images[0]?.url || 'none',
  }));
  fs.writeFileSync('all_products_detailed.json', JSON.stringify(data, null, 2));
  console.log('Wrote all_products_detailed.json');
}
main().finally(() => p.$disconnect());
