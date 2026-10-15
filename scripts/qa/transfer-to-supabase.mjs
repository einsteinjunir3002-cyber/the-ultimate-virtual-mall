import { PrismaClient } from '@prisma/client';

const localPrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres@127.0.0.1:5432/the_ultimate_mall?schema=public' } }
});

const supabasePrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres' } }
});

async function main() {
  console.log('Fetching local data for transfer to Supabase...');

  // Map mall categories by slug so foreign keys match perfectly
  const localMallCats = await localPrisma.mallCategory.findMany();
  const supaMallCats = await supabasePrisma.mallCategory.findMany();
  const slugToSupaCatId = Object.fromEntries(supaMallCats.map((c) => [c.slug, c.id]));
  const localCatIdToSlug = Object.fromEntries(localMallCats.map((c) => [c.id, c.slug]));

  // 1. Fetch shops to preserve
  const localShops = await localPrisma.shop.findMany({
    include: {
      owner: true,
      shopCategories: true,
      products: {
        include: {
          images: true,
          variants: true,
        }
      }
    }
  });

  console.log(`Found ${localShops.length} shops in local database.`);

  for (const shop of localShops) {
    console.log(`Transferring shop: ${shop.name} (${shop.slug})...`);

    // Ensure owner user exists in Supabase
    await supabasePrisma.user.upsert({
      where: { id: shop.owner.id },
      update: {
        email: shop.owner.email,
        name: shop.owner.name,
        role: shop.owner.role,
        passwordHash: shop.owner.passwordHash,
        phone: shop.owner.phone,
      },
      create: {
        id: shop.owner.id,
        email: shop.owner.email,
        name: shop.owner.name,
        role: shop.owner.role,
        passwordHash: shop.owner.passwordHash,
        phone: shop.owner.phone,
        createdAt: shop.owner.createdAt,
      }
    });

    // Upsert Shop
    await supabasePrisma.shop.upsert({
      where: { id: shop.id },
      update: {
        name: shop.name,
        slug: shop.slug,
        tagline: shop.tagline,
        description: shop.description,
        logoUrl: shop.logoUrl,
        bannerUrl: shop.bannerUrl,
        businessCategory: shop.businessCategory,
        location: shop.location,
        phone: shop.phone,
        whatsappNumber: shop.whatsappNumber,
        email: shop.email,
        status: shop.status,
        themeColor: shop.themeColor,
        templateStyle: shop.templateStyle,
        deliveryPolicy: shop.deliveryPolicy,
        returnPolicy: shop.returnPolicy,
        pickupAvailable: shop.pickupAvailable,
        baseDeliveryFee: shop.baseDeliveryFee,
        isFeatured: shop.isFeatured,
      },
      create: {
        id: shop.id,
        ownerId: shop.ownerId,
        name: shop.name,
        slug: shop.slug,
        tagline: shop.tagline,
        description: shop.description,
        logoUrl: shop.logoUrl,
        bannerUrl: shop.bannerUrl,
        businessCategory: shop.businessCategory,
        location: shop.location,
        phone: shop.phone,
        whatsappNumber: shop.whatsappNumber,
        email: shop.email,
        status: shop.status,
        themeColor: shop.themeColor,
        templateStyle: shop.templateStyle,
        deliveryPolicy: shop.deliveryPolicy,
        returnPolicy: shop.returnPolicy,
        pickupAvailable: shop.pickupAvailable,
        baseDeliveryFee: shop.baseDeliveryFee,
        isFeatured: shop.isFeatured,
        createdAt: shop.createdAt,
      }
    });

    // Upsert Shop Categories
    for (const sc of shop.shopCategories) {
      await supabasePrisma.shopCategory.upsert({
        where: { id: sc.id },
        update: {
          name: sc.name,
          slug: sc.slug,
          description: sc.description,
          displayOrder: sc.displayOrder,
          isActive: sc.isActive,
        },
        create: {
          id: sc.id,
          shopId: sc.shopId,
          name: sc.name,
          slug: sc.slug,
          description: sc.description,
          displayOrder: sc.displayOrder,
          isActive: sc.isActive,
        }
      });
    }

    // Upsert Products
    for (const prod of shop.products) {
      const targetMallCatId = prod.mallCategoryId
        ? slugToSupaCatId[localCatIdToSlug[prod.mallCategoryId]] || null
        : null;

      await supabasePrisma.product.upsert({
        where: { id: prod.id },
        update: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          salePrice: prod.salePrice,
          sku: prod.sku,
          stock: prod.stock,
          lowStockThreshold: prod.lowStockThreshold,
          brand: prod.brand,
          status: prod.status,
          isAvailable: prod.isAvailable,
          mallCategoryId: targetMallCatId,
          shopCategoryId: prod.shopCategoryId,
        },
        create: {
          id: prod.id,
          shopId: prod.shopId,
          mallCategoryId: targetMallCatId,
          shopCategoryId: prod.shopCategoryId,
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          salePrice: prod.salePrice,
          sku: prod.sku,
          stock: prod.stock,
          lowStockThreshold: prod.lowStockThreshold,
          brand: prod.brand,
          status: prod.status,
          isAvailable: prod.isAvailable,
          createdAt: prod.createdAt,
        }
      });

      // Upsert Images
      for (const img of prod.images) {
        await supabasePrisma.productImage.upsert({
          where: { id: img.id },
          update: {
            url: img.url,
            altText: img.altText,
            displayOrder: img.displayOrder,
          },
          create: {
            id: img.id,
            productId: img.productId,
            url: img.url,
            altText: img.altText,
            displayOrder: img.displayOrder,
          }
        });
      }

      // Upsert Variants
      for (const v of prod.variants) {
        await supabasePrisma.productVariant.upsert({
          where: { id: v.id },
          update: {
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
          },
          create: {
            id: v.id,
            productId: v.productId,
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
          }
        });
      }
    }
  }

  // Verify in Supabase
  const supaShops = await supabasePrisma.shop.findMany({
    select: { name: true, slug: true, _count: { select: { products: true, shopCategories: true } } }
  });
  console.log('\n[SUCCESS] Supabase verification:');
  console.log(JSON.stringify(supaShops, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  });
