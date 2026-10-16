import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const SUPABASE_URL = 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
const LOCAL_URL = 'postgresql://postgres@127.0.0.1:5432/the_ultimate_mall?schema=public';

const AFRO_BITES_IMAGE_MAP = {
  // Single-Origin Chocolates
  '85-extra-dark-ghanaian-cocoa-bar': '/uploads/prod-dark-cocoa-artisan-bar.webp',
  'bourbon-vanilla-white-chocolate-passionfruit': '/uploads/prod-white-chocolate-passionfruit.webp',
  'cocoa-nibs-dark-chocolate-praline-truffles': '/uploads/prod-dark-chocolate-truffles-box8.webp',
  'milk-chocolate-toasted-coconut-sea-salt': '/uploads/prod-milk-chocolate-coconut-seasalt.webp',
  'single-origin-72-dark-cocoa-chocolate-gift-box': '/uploads/prod-dark-cocoa-gift-box-4bars.webp',
  'spiced-chili-hot-ginger-dark-chocolate': '/uploads/prod-chili-ginger-dark-chocolate.webp',

  // Savannah Cashews
  'dark-chocolate-dipped-roasted-cashews': '/uploads/prod-dark-chocolate-dipped-cashews.webp',
  'hot-chili-cayenne-roasted-cashews-pouch': '/uploads/prod-hot-chili-cayenne-cashews.webp',
  'raw-organic-whole-cashew-kernels-500g': '/uploads/prod-raw-organic-whole-cashews.webp',
  'savannah-honey-glazed-roasted-cashews-tin': '/uploads/prod-honey-roasted-cashews.webp',
  'slow-roasted-sea-salt-whole-cashews-tin': '/uploads/prod-slow-roasted-seasalt-cashews.webp',
  'smoked-paprika-garlic-savory-cashew-crunch': '/uploads/prod-smoked-paprika-garlic-cashews.webp',

  // Dried Fruits
  'chewy-sweet-sun-dried-pineapple-rings': '/uploads/prod-sundried-pineapple-rings.webp',
  'crispy-sweet-plantain-chips-200g': '/uploads/prod-crispy-plantain-chips.webp',
  'natural-sun-dried-papaya-chunks-lime': '/uploads/prod-sundried-papaya-chunks.webp',
  'sun-dried-organic-volta-mango-strips': '/uploads/prod-sundried-volta-mango-strips.webp',
  'toasted-coconut-smiles-chips-sea-salt': '/uploads/prod-toasted-coconut-chips.webp',
  'tropical-harvest-trail-mix-250g': '/uploads/prod-tropical-harvest-trail-mix.webp',

  // Botanical Teas
  'artisan-hibiscus-sobolo-brew-tea-pouches': '/uploads/prod-sobolo-hibiscus-brew.webp',
  'chamomile-ghanaian-soursop-night-brew': '/uploads/prod-chamomile-soursop-brew.webp',
  'cocoa-husk-peppermint-energizing-tea': '/uploads/prod-uniq-1594631252845-29fc4cc8cde9.webp',
  'golden-spiced-ginger-lemongrass-tea-tin': '/uploads/prod-ginger-lemongrass-tin.webp',
  'organic-moringa-green-tea-metabolism': '/uploads/prod-uniq-1571934811356-5cc061b6821f.webp',
  'roasted-cocoa-shell-detox-tea-200g': '/uploads/prod-roasted-cocoa-shell-tea.webp'
};

// 1. Update flawless_catalog.json
if (fs.existsSync('flawless_catalog.json')) {
  const catalog = JSON.parse(fs.readFileSync('flawless_catalog.json', 'utf8'));
  let updated = 0;
  for (const item of catalog) {
    if (item.shopSlug === 'afro-bites-gourmet-treats' && AFRO_BITES_IMAGE_MAP[item.slug]) {
      const img = AFRO_BITES_IMAGE_MAP[item.slug];
      item.image = img;
      item.imageUrl = img;
      item.imageFile = path.basename(img);
      item.imageExists = true;
      item.imageSize = fs.statSync(path.join('public', img.replace(/^\//, ''))).size;
      updated++;
    }
  }
  fs.writeFileSync('flawless_catalog.json', JSON.stringify(catalog, null, 2));
  console.log(`Updated ${updated} items in flawless_catalog.json`);
}

// 2. Update current_catalog.json
if (fs.existsSync('current_catalog.json')) {
  const current = JSON.parse(fs.readFileSync('current_catalog.json', 'utf8'));
  let updated = 0;
  for (const shop of (current.shops || [])) {
    if (shop.slug === 'afro-bites-gourmet-treats') {
      for (const cat of (shop.categories || [])) {
        for (const prod of (cat.products || [])) {
          if (AFRO_BITES_IMAGE_MAP[prod.slug]) {
            prod.imageUrl = AFRO_BITES_IMAGE_MAP[prod.slug];
            prod.image = AFRO_BITES_IMAGE_MAP[prod.slug];
            updated++;
          }
        }
      }
    }
  }
  fs.writeFileSync('current_catalog.json', JSON.stringify(current, null, 2));
  console.log(`Updated ${updated} items in current_catalog.json`);
}

// 3. Update catalog_audit_complete.json
if (fs.existsSync('catalog_audit_complete.json')) {
  const audit = JSON.parse(fs.readFileSync('catalog_audit_complete.json', 'utf8'));
  let updated = 0;
  for (const item of audit) {
    if (item.shopSlug === 'afro-bites-gourmet-treats' && AFRO_BITES_IMAGE_MAP[item.slug]) {
      const img = AFRO_BITES_IMAGE_MAP[item.slug];
      item.imageUrl = img;
      item.imageFile = path.basename(img);
      item.imageExists = true;
      item.imageSize = fs.statSync(path.join('public', img.replace(/^\//, ''))).size;
      updated++;
    }
  }
  fs.writeFileSync('catalog_audit_complete.json', JSON.stringify(audit, null, 2));
  console.log(`Updated ${updated} items in catalog_audit_complete.json`);
}

// 4. Update all_products_detailed.json
if (fs.existsSync('all_products_detailed.json')) {
  const detailed = JSON.parse(fs.readFileSync('all_products_detailed.json', 'utf8'));
  let updated = 0;
  for (const item of detailed) {
    if (item.shopSlug === 'afro-bites-gourmet-treats' && AFRO_BITES_IMAGE_MAP[item.slug]) {
      item.image = AFRO_BITES_IMAGE_MAP[item.slug];
      updated++;
    }
  }
  fs.writeFileSync('all_products_detailed.json', JSON.stringify(detailed, null, 2));
  console.log(`Updated ${updated} items in all_products_detailed.json`);
}

// 5. Update Database
async function syncDatabase(prisma, dbLabel) {
  console.log(`\n--- Syncing to ${dbLabel} ---`);
  const shop = await prisma.shop.findFirst({
    where: {
      OR: [
        { slug: 'afro-bites-gourmet-treats' },
        { name: { contains: 'Afro-Bites', mode: 'insensitive' } }
      ]
    },
    include: {
      products: {
        include: { images: true }
      }
    }
  });

  if (!shop) {
    console.error(`Shop afro-bites-gourmet-treats not found in ${dbLabel}`);
    return;
  }

  console.log(`Found shop: ${shop.name} (${shop.id}) with ${shop.products.length} products`);

  let count = 0;
  for (const product of shop.products) {
    const newImgUrl = AFRO_BITES_IMAGE_MAP[product.slug];
    if (newImgUrl) {
      // Delete old images
      await prisma.productImage.deleteMany({
        where: { productId: product.id }
      });

      // Create new primary image
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: newImgUrl,
          altText: product.name,
          displayOrder: 0,
          isPrimary: true
        }
      });
      count++;
    } else {
      console.warn(`No mapping for product slug: ${product.slug}`);
    }
  }

  console.log(`Successfully updated ${count} products in ${dbLabel}`);
}

async function main() {
  // Sync to Supabase
  const supabasePrisma = new PrismaClient({
    datasources: { db: { url: SUPABASE_URL } }
  });

  try {
    await syncDatabase(supabasePrisma, 'SUPABASE');
  } catch (err) {
    console.error('Supabase sync error:', err);
  } finally {
    await supabasePrisma.$disconnect();
  }

  // Try local postgres if running
  try {
    const localPrisma = new PrismaClient({
      datasources: { db: { url: LOCAL_URL } }
    });
    await syncDatabase(localPrisma, 'LOCAL POSTGRES');
    await localPrisma.$disconnect();
  } catch {
    console.log('Local postgres is not running; skipping local sync.');
  }
}

main().catch(console.error);
