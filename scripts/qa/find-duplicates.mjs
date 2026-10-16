import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { shop: true, shopCategory: true, mallCategory: true },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Total products in local database: ${products.length}`);

  const nameMap = new Map();
  const imageMap = new Map();

  for (const p of products) {
    const normName = p.name.trim().toLowerCase();
    if (!nameMap.has(normName)) nameMap.set(normName, []);
    nameMap.get(normName).push(p);

    const firstImg = p.images?.[0];
    if (firstImg) {
      if (!imageMap.has(firstImg)) imageMap.set(firstImg, []);
      imageMap.get(firstImg).push(p);
    }
  }

  console.log('\n--- DUPLICATE PRODUCT NAMES ---');
  let dupNameCount = 0;
  for (const [name, list] of nameMap.entries()) {
    if (list.length > 1) {
      dupNameCount++;
      console.log(`\nDuplicate: "${name}" (${list.length} times):`);
      for (const item of list) {
        console.log(`  - [${item.shop.name}] -> Cat: "${item.shopCategory?.name}" | Slug: "${item.slug}" | ID: ${item.id}`);
      }
    }
  }
  console.log(`\nTotal duplicate name clusters: ${dupNameCount}`);

  console.log('\n--- DUPLICATE PRODUCT IMAGES ---');
  let dupImageCount = 0;
  for (const [img, list] of imageMap.entries()) {
    if (list.length > 1) {
      dupImageCount++;
      console.log(`\nImage: ${img} (${list.length} products):`);
      for (const item of list) {
        console.log(`  - "${item.name}" [${item.shop.name}] (${item.shopCategory?.name})`);
      }
    }
  }
  console.log(`\nTotal duplicate image clusters: ${dupImageCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
