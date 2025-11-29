import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function recreateDatabase() {
  const adminClient = new Client({
    user: 'asisvox_user',
    password: 'asisvox_user',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  });

  try {
    console.log('📍 Connecting to PostgreSQL admin database...');
    await adminClient.connect();

    // Drop existing database
    console.log('🗑️  Dropping existing database if exists...');
    try {
      // Terminate connections first
      await adminClient.query(
        "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'asisvox' AND pid <> pg_backend_pid();"
      );
      await adminClient.query('DROP DATABASE IF EXISTS asisvox');
    } catch (e) {
      console.warn('Warning:', e.message);
    }

    // Create database
    console.log('✅ Creating database asisvox...');
    await adminClient.query('CREATE DATABASE asisvox');
    await adminClient.end();

    // Connect to the new database
    const client = new Client({
      user: 'asisvox_user',
      password: 'asisvox_user',
      host: 'localhost',
      port: 5432,
      database: 'asisvox'
    });

    await client.connect();
    console.log('✅ Connected to asisvox database');

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

    await client.end();
    console.log('\n✅ Database recreation complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

recreateDatabase();
