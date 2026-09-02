import 'dotenv/config';
import { Client } from 'pg';

// One-off maintenance script: promotes an existing user row to ADMIN.
// Kept because it is occasionally useful after a manual signup, but note that
// the DB role does not by itself grant access — the email must be in
// ADMIN_EMAILS for the app's gates to let it into /admin. See src/lib/admin.ts.
//
// Run with:  npx tsx admin-fix.ts
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function promote() {
  const email = (process.env.ADMIN_EMAILS || process.env.MASTER_ADMIN_EMAIL || '')
    .split(',')[0]
    .toLowerCase()
    .trim();

  if (!connectionString || !email) {
    console.error("Set DIRECT_URL and ADMIN_EMAILS in .env first.");
    return;
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log(`Connected. Promoting ${email}...`);

    const res = await client.query(
      'UPDATE "User" SET role = $1 WHERE email = $2 RETURNING id, email, role',
      ['ADMIN', email]
    );

    if (res.rowCount === 0) {
      console.error(`❌ FAILED: User '${email}' not found in database.`);
    } else {
      console.log("✅ SUCCESS!");
      console.log(res.rows[0]);
    }
  } catch (err: any) {
    console.error("❌ ERROR:", err.message);
  } finally {
    await client.end();
  }
}

promote();
