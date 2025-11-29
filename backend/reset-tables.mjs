import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetTables() {
  const pool = new Pool({
    user: 'asisvox_user',
    password: 'asisvox_user',
    host: 'localhost',
    port: 5432,
    database: 'asisvox_db'
  });

  try {
    const client = await pool.connect();
    
    // Get all tables
    console.log('📍 Getting list of tables...');
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `);
    
    const tables = tablesResult.rows.map(row => row.tablename);
    console.log(`Found ${tables.length} tables:`, tables);

    // Drop tables in reverse order of dependencies
    if (tables.length > 0) {
      console.log('\n🗑️  Dropping tables...');
      for (const table of tables) {
        try {
          await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
          console.log(`  ✅ Dropped ${table}`);
        } catch (e) {
          console.warn(`  ⚠️  Could not drop ${table}:`, e.message);
        }
      }
    }

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'src', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('\n⚙️  Executing schema.sql...');
    await client.query(schema);
    console.log('✅ Schema created successfully');

    // Read and execute seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf-8');
      console.log('⚙️  Executing seed.sql...');
      await client.query(seed);
      console.log('✅ Seed data inserted successfully');
    }

    client.release();
    console.log('\n✅ Database reset complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetTables();
