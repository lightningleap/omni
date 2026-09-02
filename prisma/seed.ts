import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hash } from 'bcryptjs';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- CONFIGURATION ---
  // Read from the environment so no credential ever lives in the repository.
  // The email must also be listed in ADMIN_EMAILS, otherwise the app's gates
  // will still refuse it — the DB row alone does not grant admin access.
  const BOSS_EMAIL = (process.env.ADMIN_EMAILS || process.env.MASTER_ADMIN_EMAIL || '')
    .split(',')[0]
    .toLowerCase()
    .trim();
  const TEMP_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

  if (!BOSS_EMAIL || !TEMP_PASSWORD) {
    throw new Error(
      'Set ADMIN_EMAILS (or MASTER_ADMIN_EMAIL) and SEED_ADMIN_PASSWORD in .env before seeding.'
    );
  }
  // ---------------------

  console.log('🌱 Starting Admin Promotion Seeding...');

  const hashedPassword = await hash(TEMP_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: BOSS_EMAIL },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: BOSS_EMAIL,
      name: 'Omnidrop Admin',
      role: 'ADMIN',
      password: hashedPassword,
    } as any,
  });

  console.log(`✅ Admin account ${admin.email} promoted/created.`);
  console.log('🚀 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
