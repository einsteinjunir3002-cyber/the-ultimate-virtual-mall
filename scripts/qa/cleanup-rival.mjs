import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deletedShops = await prisma.shop.deleteMany({
    where: { slug: 'qa-rival-temp-shop' }
  });
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: 'qa.rival@example.com' }
  });
  console.log(`Cleaned up ${deletedShops.count} rival shops and ${deletedUsers.count} rival test users.`);
}

main()
  .catch((err) => {
    console.error('Cleanup error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
