import { PrismaClient } from '@prisma/client';

const poolerUrl = 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sessionUrl = 'postgresql://postgres.plctcjxlyhzbufybpatq:Mall2026SecurePass%23Db%21@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

async function testConnection(name, url) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const res = await prisma.$queryRaw`SELECT 1 as test, current_database() as db, version() as v;`;
    console.log(`[SUCCESS] ${name} connected! Result:`, res);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.error(`[FAIL] ${name} error:`, err.message);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  console.log('Testing Supabase Transaction Pooler (eu-west-1)...');
  const ok1 = await testConnection('Transaction Pooler', poolerUrl);
  if (!ok1) {
    console.log('Testing Supabase Session Pooler (eu-west-1)...');
    await testConnection('Session Pooler', sessionUrl);
  }
}

main();
