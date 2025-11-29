import { Client } from 'pg';

async function checkAndCreateDB() {
  const adminClient = new Client({
    user: 'asisvox_user',
    password: 'asisvox_user',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to postgres database');

    // List existing databases
    const result = await adminClient.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    console.log('📊 Existing databases:');
    result.rows.forEach(row => console.log('  -', row.datname));

    // Check if asisvox exists
    const check = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = 'asisvox';");
    
    if (check.rows.length === 0) {
      console.log('\n🔨 Creating asisvox database...');
      await adminClient.query('CREATE DATABASE asisvox OWNER asisvox_user;');
      console.log('✅ Database asisvox created');
    } else {
      console.log('\n✅ Database asisvox already exists');
    }

    await adminClient.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndCreateDB();
