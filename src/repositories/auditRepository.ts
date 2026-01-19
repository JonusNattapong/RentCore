import pool from '../config/database';

export interface AuditLog {
  id: string;
  user_id?: string;
  branch_id?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CONFIRM' | 'LOCK' | 'UNLOCK' | 'VOID';
  entity_type: string;
  entity_id?: string;
  before_json?: any;
  after_json?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export class AuditRepository {
  async create(log: Partial<AuditLog>): Promise<AuditLog> {
    const { user_id, branch_id, action, entity_type, entity_id, before_json, after_json, ip_address, user_agent } = log;
    const result = await pool.query(
      'INSERT INTO audit_logs (user_id, branch_id, action, entity_type, entity_id, before_json, after_json, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [user_id, branch_id, action, entity_type, entity_id, before_json, after_json, ip_address, user_agent]
    );
    return result.rows[0];
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const result = await pool.query(
      'SELECT * FROM audit_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC',
      [entityType, entityId]
    );
    return result.rows;
  }
}
