import pool from '../config/database';

export class FloorRepository {
  async findAll(buildingId?: string) {
    let query = 'SELECT * FROM floors';
    const params = [];
    if (buildingId) {
      query += ' WHERE building_id = $1';
      params.push(buildingId);
    }
    const result = await pool.query(query, params);
    return result.rows;
  }

  async create(data: any) {
    const { building_id, name, floor_no, sort_order } = data;
    const result = await pool.query(
      'INSERT INTO floors (building_id, name, floor_no, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [building_id, name, floor_no, sort_order || 0]
    );
    return result.rows[0];
  }
}
