const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_F26QfAiLDYJS@ep-rough-unit-a40frcro-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await pool.connect();
    
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/20260102000000_add_article_relations_table/migration.sql'),
      'utf8'
    );
    
    console.log('Executing migration...');
    await pool.query(migrationSQL);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
