const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
});

async function recreateDatabase() {
  try {
    console.log('📍 Connecting to PostgreSQL...');
    await client.connect();

    // Drop existing database
    console.log('🗑️  Dropping existing database...');
    await client.query('DROP DATABASE IF EXISTS asisvox');
    
    // Create database
    console.log('✅ Creating database asisvox...');
    await client.query('CREATE DATABASE asisvox');
    
    await client.end();
    
    // Connect to the new database
    const newClient = new Client({
      user: 'postgres',
      password: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'asisvox'
    });
    
    await newClient.connect();
    console.log('✅ Connected to asisvox database');

    // Read and execute schema.sql
    const schemaPath = path.join('c:', 'Users', 'GHOPsT', 'Desktop', 'PPP_Grupo2', 'ASISvOX', 'backend', 'src', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('⚙️  Executing schema.sql...');
    await newClient.query(schema);
    console.log('✅ Schema created successfully');

    // Read and execute seed.sql
    const seedPath = path.join('c:', 'Users', 'GHOPsT', 'Desktop', 'PPP_Grupo2', 'ASISvOX', 'backend', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf-8');
      console.log('⚙️  Executing seed.sql...');
      await newClient.query(seed);
      console.log('✅ Seed data inserted successfully');
    }

    await newClient.end();
    console.log('\n✅ Database recreation complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

recreateDatabase();
