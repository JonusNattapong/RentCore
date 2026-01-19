import pool from '../config/database';

export interface Tenant {
  id: string;
  tenant_code?: string;
  full_name: string;
  phone?: string;
  email?: string;
  id_card_no?: string;
  address?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class TenantRepository {
  async findAll(): Promise<Tenant[]> {
    const result = await pool.query('SELECT * FROM tenants WHERE is_active = true ORDER BY full_name ASC');
    return result.rows;
  }

  async findById(id: string): Promise<Tenant | null> {
    const result = await pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(tenant: Partial<Tenant>): Promise<Tenant> {
    const { tenant_code, full_name, phone, email, id_card_no, address } = tenant;
    const result = await pool.query(
      'INSERT INTO tenants (tenant_code, full_name, phone, email, id_card_no, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [tenant_code, full_name, phone, email, id_card_no, address]
    );
    return result.rows[0];
  }

  async update(id: string, tenant: Partial<Tenant>): Promise<Tenant | null> {
    const { full_name, phone, email, id_card_no, address, is_active } = tenant;
    const result = await pool.query(
      'UPDATE tenants SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), email = COALESCE($3, email), id_card_no = COALESCE($4, id_card_no), address = COALESCE($5, address), is_active = COALESCE($6, is_active) WHERE id = $7 RETURNING *',
      [full_name, phone, email, id_card_no, address, is_active, id]
    );
    return result.rows[0] || null;
  }
}
