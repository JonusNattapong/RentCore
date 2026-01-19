import pool from '../config/database';

export class ReportRepository {
  async getOccupancyStatus(branchId?: string) {
    let query = `
      SELECT 
        status, 
        COUNT(*) as count
      FROM rooms
      WHERE is_active = true
    `;
    const params = [];
    if (branchId) {
      query += ' AND branch_id = $1';
      params.push(branchId);
    }
    query += ' GROUP BY status';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async getMonthlyRevenue(year: number, month: number, branchId?: string) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    let query = `
      SELECT 
        COALESCE(SUM(total), 0) as total_invoiced,
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN total ELSE 0 END), 0) as total_collected
      FROM invoices
      WHERE created_at BETWEEN $1 AND $2
    `;
    const params: any[] = [startDate, endDate];
    if (branchId) {
      query += ' AND branch_id = $3';
      params.push(branchId);
    }
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  async getCollectionPerformance(branchId?: string) {
    let query = `
      SELECT 
        b.name as branch_name,
        COUNT(i.id) as total_invoices,
        SUM(CASE WHEN i.status = 'PAID' THEN 1 ELSE 0 END) as paid_count,
        ROUND((SUM(CASE WHEN i.status = 'PAID' THEN 1 ELSE 0 END)::numeric / COUNT(i.id)) * 100, 2) as collection_rate
      FROM branches b
      LEFT JOIN invoices i ON b.id = i.branch_id
      WHERE b.is_active = true
    `;
    const params = [];
    if (branchId) {
      query += ' AND b.id = $1';
      params.push(branchId);
    }
    query += ' GROUP BY b.id, b.name';
    const result = await pool.query(query, params);
    return result.rows;
  }
}
