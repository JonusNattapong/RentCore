import pool from '../config/database';
import { MeterReading } from '../types';

export class MeterRepository {
  async findLastByRoom(roomId: string, meterType: string): Promise<MeterReading | null> {
    const result = await pool.query(
      'SELECT * FROM meter_readings WHERE room_id = $1 AND meter_type = $2 ORDER BY reading_date DESC LIMIT 1',
      [roomId, meterType]
    );
    return result.rows[0] || null;
  }

  async create(data: Partial<MeterReading>): Promise<MeterReading> {
    const { room_id, branch_id, meter_type, previous_value, current_value, reading_date } = data;
    const result = await pool.query(
      'INSERT INTO meter_readings (room_id, branch_id, meter_type, previous_value, current_value, reading_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [room_id, branch_id, meter_type, previous_value, current_value, reading_date || new Date()]
    );
    return result.rows[0];
  }

  async findAll(branchId?: string): Promise<MeterReading[]> {
    let query = 'SELECT * FROM meter_readings';
    const params = [];
    if (branchId) {
      query += ' WHERE branch_id = $1';
      params.push(branchId);
    }
    query += ' ORDER BY reading_date DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }
}
