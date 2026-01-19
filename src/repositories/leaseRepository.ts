import pool from '../config/database';
import { Lease } from '../types';

export class LeaseRepository {
  async findAllWithTenants(): Promise<any[]> {
    const query = `
      SELECT l.*, t.email as tenant_email 
      FROM leases l 
      JOIN tenants t ON l.tenant_id = t.id 
      WHERE l.status = 'ACTIVE'
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findAll(branchId?: string): Promise<Lease[]> {
    let query = 'SELECT * FROM leases';
    const params: any[] = [];
    if (branchId) {
      query += ' WHERE branch_id = $1';
      params.push(branchId);
    }
    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: string): Promise<Lease | null> {
    const result = await pool.query('SELECT * FROM leases WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(lease: Partial<Lease>): Promise<Lease> {
    const { room_id, tenant_id, branch_id, start_date, end_date, rent_monthly, deposit_amount, billing_day } = lease;
    
    // Start a transaction to ensure both lease is created and room status is updated
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const res = await client.query(
        'INSERT INTO leases (room_id, tenant_id, branch_id, start_date, end_date, rent_monthly, deposit_amount, billing_day) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [room_id, tenant_id, branch_id, start_date, end_date, rent_monthly, deposit_amount, billing_day || 1]
      );
      
      await client.query('UPDATE rooms SET status = $1 WHERE id = $2', ['OCCUPIED_MONTHLY', room_id]);
      
      await client.query('COMMIT');
      return res.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async updateStatus(id: string, status: string): Promise<Lease | null> {
    const result = await pool.query(
      'UPDATE leases SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
}
