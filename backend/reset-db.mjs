import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetDatabase() {
  const pool = new Pool({
    user: 'asisvox_user',
    password: 'asisvox_user',
    host: 'localhost',
    port: 5432,
    database: 'asisvox_db'
  });

  try {
    console.log('📍 Connecting to asisvox database...');
    const client = await pool.connect();
    
    // Drop all existing tables
    console.log('🗑️  Dropping all existing tables...');
    const dropQuery = `
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
    `;
    await client.query(dropQuery);
    console.log('✅ All tables dropped');

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'src', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('⚙️  Executing schema.sql...');
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
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase();
