import pool from '../config/database';
import { DailyStay } from '../types';

export class DailyStayRepository {
  async findAvailable(branchId: string, checkIn: Date, checkOut: Date) {
    const query = `
      SELECT r.* 
      FROM rooms r
      WHERE r.branch_id = $1 
      AND r.status = 'VACANT'
      AND r.is_active = true
      AND r.id NOT IN (
        SELECT room_id 
        FROM daily_stays 
        WHERE status IN ('RESERVED', 'CHECKED_IN')
        AND (
          (check_in_at, check_out_at) OVERLAPS ($2, $3)
        )
      )
    `;
    const result = await pool.query(query, [branchId, checkIn, checkOut]);
    return result.rows;
  }

  async create(data: Partial<DailyStay>): Promise<DailyStay> {
    const { room_id, tenant_id, branch_id, check_in_at, check_out_at, nights, price_per_night, total_amount } = data;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const res = await client.query(
        'INSERT INTO daily_stays (room_id, tenant_id, branch_id, check_in_at, check_out_at, nights, price_per_night, total_amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [room_id, tenant_id, branch_id, check_in_at, check_out_at, nights, price_per_night, total_amount, 'RESERVED']
      );
      
      await client.query('UPDATE rooms SET status = $1 WHERE id = $2', ['OCCUPIED_DAILY', room_id]);
      
      await client.query('COMMIT');
      return res.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<DailyStay | null> {
    const result = await pool.query('SELECT * FROM daily_stays WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async updateStatus(id: string, status: string): Promise<DailyStay | null> {
    const result = await pool.query(
      'UPDATE daily_stays SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
}
