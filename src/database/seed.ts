import bcrypt from 'bcryptjs';
import pool from '../config/database';

const seed = async () => {
  try {
    console.log('Starting seeding...');
    
    // 1. Create Default Role
    const roleId = '00000000-0000-0000-0000-000000000001';
    await pool.query(
      'INSERT INTO roles (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
      [roleId, 'OWNER', 'System Owner with full access']
    );

    // 2. Create Default Branch
    const branchId = '00000000-0000-0000-0000-000000000001';
    await pool.query(
      'INSERT INTO branches (id, code, name, address) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING',
      [branchId, 'B001', 'Head Office', '123 Main St']
    );

    // 3. Create Admin User
    const passwordHash = await bcrypt.hash('admin123', 10);
    await pool.query(
      "INSERT INTO users (branch_id, role_id, username, password_hash, full_name, email) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (username) DO NOTHING",
      [branchId, roleId, 'admin', passwordHash, 'System Admin', 'admin@rentcore.local']
    );

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
