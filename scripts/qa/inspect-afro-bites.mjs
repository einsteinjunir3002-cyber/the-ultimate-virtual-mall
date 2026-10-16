import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';

const SUPABASE_URL = 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
const prisma = new PrismaClient({
  datasources: {
    db: { url: SUPABASE_URL }
  }
});

async function main() {
  const shop = await prisma.shop.findFirst({
    where: {
      OR: [
        { slug: 'afro-bites-gourmet-treats' },
        { name: { contains: 'Afro-Bites', mode: 'insensitive' } }
      ]
    },
    include: {
      shopCategories: true,
      products: {
        include: {
          images: true,
          shopCategory: true
        }
      }
    }
  });

  if (!shop) {
    console.log('Shop not found in db');
    return;
  }

  console.log('Found shop:', shop.name, 'slug:', shop.slug, 'id:', shop.id);
  console.log('Categories:', shop.shopCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
  console.log('Product count:', shop.products.length);

  const out = shop.products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.shopCategory ? p.shopCategory.name : 'NO CATEGORY',
    categorySlug: p.shopCategory ? p.shopCategory.slug : null,
    images: p.images.map(img => ({ id: img.id, url: img.url, altText: img.altText }))
  }));

  fs.writeFileSync('scripts/qa/afro_bites_db_products.json', JSON.stringify(out, null, 2));
  console.log('Saved to scripts/qa/afro_bites_db_products.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());
