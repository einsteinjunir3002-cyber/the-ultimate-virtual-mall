import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial platform data for The Ultimate Virtual Mall...');

  // 1. Seed or update Super Admin account
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'bigsam@theultimatemall.com';
  const superAdminUsername = process.env.SUPER_ADMIN_USERNAME || 'Big Sam';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'BigSam12345';
  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: superAdminUsername,
      passwordHash,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
    create: {
      name: superAdminUsername,
      email: superAdminEmail,
      passwordHash,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log(`✓ Super Admin created: ${admin.name} (${admin.email})`);

  // 2. Initialize Platform Configuration
  await prisma.platformConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      mallName: 'The Ultimate Virtual Mall',
      mallTagline: "Ghana's Premier Digital Shopping Destination",
      contactEmail: 'support@theultimatemall.com',
      contactPhone: '+233 24 123 4567',
      whatsappSupport: '+233241234567',
      defaultCommissionPercent: 5.0,
      currency: 'GHS',
      currencySymbol: 'GH₵',
      maintenanceMode: false,
    },
  });
  console.log('✓ Platform configuration initialized');

  // 3. Initialize Mall Global Categories (Categories for merchants to select from)
  const defaultMallCategories = [
    {
      name: 'Electronics & Gadgets',
      slug: 'electronics',
      description: 'Smartphones, computing, audio, home entertainment and accessories',
      icon: 'Laptop',
      displayOrder: 1,
    },
    {
      name: 'Fashion & Apparel',
      slug: 'fashion',
      description: 'Men, women, kids clothing, authentic African prints, footwear and jewelry',
      icon: 'Shirt',
      displayOrder: 2,
    },
    {
      name: 'Beauty & Cosmetics',
      slug: 'beauty',
      description: 'Skincare, hair products, fragrances, makeup and personal grooming',
      icon: 'Sparkles',
      displayOrder: 3,
    },
    {
      name: 'Groceries & Essentials',
      slug: 'groceries',
      description: 'Fresh provisions, packaged foods, household goods and daily essentials',
      icon: 'ShoppingBag',
      displayOrder: 4,
    },
    {
      name: 'Home & Furniture',
      slug: 'home-furniture',
      description: 'Interior decor, living room furniture, kitchenware and bedding',
      icon: 'Armchair',
      displayOrder: 5,
    },
    {
      name: 'Food & Beverages',
      slug: 'food-beverages',
      description: 'Ready-to-eat meals, artisan treats, specialty coffee and refreshments',
      icon: 'UtensilsCrossed',
      displayOrder: 6,
    },
    {
      name: 'Books & Stationery',
      slug: 'books-stationery',
      description: 'Educational books, literature, office supplies and art materials',
      icon: 'BookOpen',
      displayOrder: 7,
    },
    {
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Workout equipment, athletic wear, sports gear and wellness tools',
      icon: 'Dumbbell',
      displayOrder: 8,
    },
    {
      name: 'Automotive & Hardware',
      slug: 'automotive-hardware',
      description: 'Vehicle accessories, power tools, maintenance gear and hardware',
      icon: 'Wrench',
      displayOrder: 9,
    },
  ];

  for (const cat of defaultMallCategories) {
    await prisma.mallCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
      },
      create: cat,
    });
  }
  console.log(`✓ ${defaultMallCategories.length} Mall categories initialized`);

  console.log('✓ Seeding complete: 0 dummy merchants, 0 dummy products. Platform ready for real registrations!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
