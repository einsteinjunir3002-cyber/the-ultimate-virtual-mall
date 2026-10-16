import { PrismaClient } from '@prisma/client';

const SUPABASE_DB = 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

async function checkDb(name, url) {
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });

  try {
    const products = await prisma.product.findMany({
      include: { shop: true, shopCategory: true, mallCategory: true },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`\n========================================`);
    console.log(`DATABASE: ${name} (${products.length} products)`);
    console.log(`========================================`);

    const uncat = products.filter(p => !p.shopCategoryId);
    console.log(`Products without shopCategory: ${uncat.length}`);
    for (const u of uncat) {
      console.log(`  - [${u.shop.name}] "${u.name}" (slug: ${u.slug}, ID: ${u.id})`);
    }

    const nameMap = new Map();
    for (const p of products) {
      const norm = p.name.trim().toLowerCase();
      if (!nameMap.has(norm)) nameMap.set(norm, []);
      nameMap.get(norm).push(p);
    }

    let dups = 0;
    for (const [k, v] of nameMap.entries()) {
      if (v.length > 1) {
        dups++;
        console.log(`Duplicate: "${k}" (${v.length} times):`);
        for (const item of v) {
          console.log(`  - [${item.shop.name}] Cat: "${item.shopCategory?.name}" | Slug: "${item.slug}" | ID: ${item.id}`);
        }
      }
    }
    console.log(`Total duplicate name clusters: ${dups}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await checkDb('LOCAL', process.env.DATABASE_URL);
  await checkDb('SUPABASE', SUPABASE_DB);
}

main().catch(console.error);
