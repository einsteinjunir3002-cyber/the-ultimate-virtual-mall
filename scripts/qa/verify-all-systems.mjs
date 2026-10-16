import { PrismaClient } from '@prisma/client';

const SUPABASE_URL = 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
const prisma = new PrismaClient({ datasources: { db: { url: SUPABASE_URL } } });

async function verifySupabase() {
  console.log('Connecting to Supabase...');
  const shops = await prisma.shop.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      shopCategories: {
        include: {
          products: {
            include: { images: true }
          }
        }
      },
      products: {
        include: { images: true }
      }
    }
  });

  console.log(`\n==============================================`);
  console.log(`SUPABASE LIVE DATABASE AUDIT (${shops.length} SHOPS)`);
  console.log(`==============================================`);

  let grandTotalProducts = 0;
  const allImageUrls = new Set();
  let dupes = 0;

  shops.forEach((s, idx) => {
    console.log(`\nShop #${idx + 1}: ${s.name} (${s.slug})`);
    console.log(`  Products Count: ${s.products.length}`);
    grandTotalProducts += s.products.length;

    s.shopCategories.forEach(cat => {
      console.log(`    - Category "${cat.name}": ${cat.products.length} products`);
    });

    s.products.forEach(p => {
      p.images.forEach(img => {
        if (allImageUrls.has(img.url)) {
          dupes++;
          console.warn(`    [!] Duplicate image URL: ${img.url} on product "${p.name}"`);
        }
        allImageUrls.add(img.url);
      });
    });
  });

  console.log(`\n==============================================`);
  console.log(`SUMMARY:`);
  console.log(`  - Total Active Shops: ${shops.length}`);
  console.log(`  - First Shop: ${shops[0]?.name}`);
  console.log(`  - Total Products: ${grandTotalProducts}`);
  console.log(`  - Total Unique Image URLs: ${allImageUrls.size}`);
  console.log(`  - Duplicate Image URLs: ${dupes}`);
  console.log(`==============================================`);

  await prisma.$disconnect();
}

verifySupabase().catch(err => {
  console.error('Error auditing Supabase:', err);
  process.exit(1);
});
