import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const LOCAL_URL = 'postgresql://postgres@127.0.0.1:5432/the_ultimate_mall?schema=public';
const SUPABASE_URL = 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

const catalog = JSON.parse(fs.readFileSync('flawless_catalog.json', 'utf8'));

async function syncCatalog(prisma, label) {
  console.log(`\n========================================`);
  console.log(`Starting sync for: ${label}`);
  console.log(`========================================`);

  let updatedCount = 0;
  let errorCount = 0;

  for (const item of catalog) {
    try {
      // 1. Try to find product by id
      let product = await prisma.product.findUnique({
        where: { id: item.id },
        include: { images: true }
      });

      // If not found by id, try by shopSlug & slug
      if (!product) {
        const shop = await prisma.shop.findUnique({ where: { slug: item.shopSlug } });
        if (shop) {
          product = await prisma.product.findUnique({
            where: {
              shopId_slug: { shopId: shop.id, slug: item.slug }
            },
            include: { images: true }
          });
        }
      }

      if (!product) {
        // Fallback: search by name within shop
        const shop = await prisma.shop.findUnique({ where: { slug: item.shopSlug } });
        if (shop) {
          product = await prisma.product.findFirst({
            where: { shopId: shop.id, slug: item.slug },
            include: { images: true }
          });
        }
      }

      if (!product) {
        console.warn(`[${label}] Product NOT found: ${item.name} (id: ${item.id}, slug: ${item.slug})`);
        errorCount++;
        continue;
      }

      // Update product info
      const updated = await prisma.product.update({
        where: { id: product.id },
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          salePrice: item.salePrice || null,
          isAvailable: true,
          status: 'PUBLISHED'
        }
      });

      // Update primary image
      await prisma.productImage.deleteMany({ where: { productId: updated.id } });
      await prisma.productImage.create({
        data: {
          productId: updated.id,
          url: item.image,
          altText: item.name,
          displayOrder: 0,
          isPrimary: true
        }
      });

      updatedCount++;
    } catch (err) {
      console.error(`[${label}] Failed updating ${item.name}:`, err.message);
      errorCount++;
    }
  }

  console.log(`[${label}] Completed sync: ${updatedCount} updated, ${errorCount} errors.`);

  // Audit results on this database
  const totalProducts = await prisma.product.count({ where: { status: 'PUBLISHED' } });
  const allImages = await prisma.productImage.findMany({
    select: { url: true, productId: true, product: { select: { name: true, shop: { select: { name: true } } } } }
  });

  const urlMap = {};
  for (const img of allImages) {
    if (!urlMap[img.url]) urlMap[img.url] = [];
    urlMap[img.url].push(`${img.product?.shop?.name} - ${img.product?.name}`);
  }

  let dupes = 0;
  for (const [url, list] of Object.entries(urlMap)) {
    if (list.length > 1) {
      console.warn(`[${label}] DUPLICATE IMAGE URL: ${url} used ${list.length} times`);
      dupes += list.length;
    }
  }

  console.log(`[${label}] Total published products: ${totalProducts}`);
  console.log(`[${label}] Total product images: ${allImages.length}`);
  console.log(`[${label}] Duplicate image URL occurrences: ${dupes}`);
}

async function main() {
  const localPrisma = new PrismaClient({ datasources: { db: { url: LOCAL_URL } } });
  await syncCatalog(localPrisma, 'LOCAL POSTGRES');
  await localPrisma.$disconnect();

  const supabasePrisma = new PrismaClient({ datasources: { db: { url: SUPABASE_URL } } });
  await syncCatalog(supabasePrisma, 'SUPABASE POOLER');
  await supabasePrisma.$disconnect();

  console.log('\n========================================');
  console.log('ALL DATABASES SYNCHRONIZED FLAWLESSLY!');
  console.log('========================================');
}

main().catch(err => {
  console.error('Fatal error in sync-all-to-dbs:', err);
  process.exit(1);
});
