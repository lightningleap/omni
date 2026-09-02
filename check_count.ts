import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const count = await prisma.collection.count();
  console.log('COLLECTION_COUNT:', count);
  process.exit(0);
}
run();
