import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const shop = await prisma.shop.findUnique({
    where: { slug: 'accra-gadget-hub-test' },
    include: {
      shopCategories: true,
      products: {
        select: {
          id: true,
          name: true,
          shopCategoryId: true,
          shopCategory: { select: { name: true, slug: true } }
        }
      }
    }
  });

  if (!shop) {
    console.log('Shop not found');
    return;
  }

  console.log('Categories:', shop.shopCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
  console.log('Products count:', shop.products.length);
  const byCategory = {};
  for (const p of shop.products) {
    const catName = p.shopCategory ? `${p.shopCategory.name} (${p.shopCategory.slug})` : 'Unassigned';
    byCategory[catName] = (byCategory[catName] || 0) + 1;
  }
  console.log('Products by category:', byCategory);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
