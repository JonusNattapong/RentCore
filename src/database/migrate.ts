import fs from 'fs';
import path from 'path';
import pool from '../config/database';

const migrate = async () => {
  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Starting migration...');
    await pool.query(sql);
    console.log('Migration completed successfully.');
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
