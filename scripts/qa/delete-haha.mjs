import { PrismaClient } from '@prisma/client';

const localPrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres@127.0.0.1:5432/the_ultimate_mall?schema=public' } }
});

const supabasePrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres' } }
});

async function main() {
  console.log('Deleting "hahaha" shop as explicitly instructed by user...');

  // 1. Delete from local DB
  try {
    const localDel = await localPrisma.shop.deleteMany({
      where: { slug: 'hahaha' }
    });
    console.log(`Local DB: deleted ${localDel.count} shop(s) with slug "hahaha".`);
  } catch (e) {
    console.error('Local DB delete error:', e.message);
  }

  // 2. Delete from Supabase DB
  try {
    const supaDel = await supabasePrisma.shop.deleteMany({
      where: { slug: 'hahaha' }
    });
    console.log(`Supabase DB: deleted ${supaDel.count} shop(s) with slug "hahaha".`);
  } catch (e) {
    console.error('Supabase DB delete error:', e.message);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  });
