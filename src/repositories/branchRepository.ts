import pool from '../config/database';
import { Branch } from '../types';

export class BranchRepository {
  async findAll(): Promise<Branch[]> {
    const result = await pool.query('SELECT * FROM branches WHERE is_active = true ORDER BY name ASC');
    return result.rows;
  }

  async findById(id: string): Promise<Branch | null> {
    const result = await pool.query('SELECT * FROM branches WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(branch: Partial<Branch>): Promise<Branch> {
    const { code, name, address, phone, water_rate, electric_rate, promptpay_id, bank_account_no, bank_account_name } = branch;
    const result = await pool.query(
      'INSERT INTO branches (code, name, address, phone, water_rate, electric_rate, promptpay_id, bank_account_no, bank_account_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [code, name, address, phone, water_rate || 15, electric_rate || 7, promptpay_id, bank_account_no, bank_account_name]
    );
    return result.rows[0];
  }

  async update(id: string, branch: Partial<Branch>): Promise<Branch | null> {
    const { name, address, phone, water_rate, electric_rate, promptpay_id, bank_account_no, bank_account_name, is_active } = branch;
    const result = await pool.query(
      `UPDATE branches SET 
        name = COALESCE($1, name), 
        address = COALESCE($2, address), 
        phone = COALESCE($3, phone), 
        water_rate = COALESCE($4, water_rate),
        electric_rate = COALESCE($5, electric_rate),
        promptpay_id = COALESCE($6, promptpay_id),
        bank_account_no = COALESCE($7, bank_account_no),
        bank_account_name = COALESCE($8, bank_account_name),
        is_active = COALESCE($9, is_active) 
      WHERE id = $10 RETURNING *`,
      [name, address, phone, water_rate, electric_rate, promptpay_id, bank_account_no, bank_account_name, is_active, id]
    );
    return result.rows[0] || null;
  }
}
