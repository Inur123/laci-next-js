import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "LogActivity" SET module = 'USER' WHERE module = 'WILAYAH'`
    );
    console.log(`Updated ${result} rows`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
