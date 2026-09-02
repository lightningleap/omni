import pg from 'pg';
const { Client } = pg;

const url = "postgresql://postgres:password@localhost:5432/unrwly";
console.log('Testing local Docker DB...');
const client = new Client({ connectionString: url });
try {
  await client.connect();
  const res = await client.query('SELECT NOW()');
  console.log('✅ SUCCESS:', res.rows[0]);
  
  // Check if tables exist
  const tables = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`);
  console.log('Tables:', tables.rows.map(r => r.tablename));
  
  await client.end();
} catch (err) {
  console.error('❌ FAILED:', err.message);
}
