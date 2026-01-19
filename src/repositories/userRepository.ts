import pool from '../config/database';

export interface User {
  id: string;
  branch_id?: string;
  role_id: string;
  username: string;
  password_hash: string;
  full_name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class UserRepository {
  async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [id]);
  }
}
