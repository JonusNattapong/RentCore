import pool from '../config/database';
import { Room } from '../types';

export class RoomRepository {
  async findAll(branchId?: string): Promise<Room[]> {
    let query = 'SELECT * FROM rooms WHERE is_active = true';
    const params: any[] = [];
    
    if (branchId) {
      query += ' AND branch_id = $1';
      params.push(branchId);
    }
    
    query += ' ORDER BY room_no ASC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: string): Promise<Room | null> {
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(room: Partial<Room>): Promise<Room> {
    const { floor_id, branch_id, room_no, room_type, capacity, status, area_sqm } = room;
    const result = await pool.query(
      'INSERT INTO rooms (floor_id, branch_id, room_no, room_type, capacity, status, area_sqm) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [floor_id, branch_id, room_no, room_type, capacity || 1, status || 'VACANT', area_sqm]
    );
    return result.rows[0];
  }

  async update(id: string, room: Partial<Room>): Promise<Room | null> {
    const { room_no, room_type, capacity, status, area_sqm, is_active } = room;
    const result = await pool.query(
      'UPDATE rooms SET room_no = COALESCE($1, room_no), room_type = COALESCE($2, room_type), capacity = COALESCE($3, capacity), status = COALESCE($4, status), area_sqm = COALESCE($5, area_sqm), is_active = COALESCE($6, is_active) WHERE id = $7 RETURNING *',
      [room_no, room_type, capacity, status, area_sqm, is_active, id]
    );
    return result.rows[0] || null;
  }
}
