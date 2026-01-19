import pool from '../config/database';

export class BuildingRepository {
  async findAll(branchId?: string) {
    let query = 'SELECT * FROM buildings WHERE is_active = true';
    const params = [];
    if (branchId) {
      query += ' AND branch_id = $1';
      params.push(branchId);
    }
    const result = await pool.query(query, params);
    return result.rows;
  }

  async create(data: any) {
    const { branch_id, name, sort_order } = data;
    const result = await pool.query(
      'INSERT INTO buildings (branch_id, name, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [branch_id, name, sort_order || 0]
    );
    return result.rows[0];
  }
}
