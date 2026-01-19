import pool from '../config/database';
import { Invoice } from '../types';
import { subDays } from 'date-fns';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_type: 'RENT' | 'WATER' | 'ELECTRIC' | 'COMMON_FEE' | 'PENALTY' | 'OTHER';
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
}

export class InvoiceRepository {
  async findAll(branchId?: string): Promise<Invoice[]> {
    let query = 'SELECT * FROM invoices';
    const params: any[] = [];
    if (branchId) {
      query += ' WHERE branch_id = $1';
      params.push(branchId);
    }
    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: string): Promise<Invoice | null> {
    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByIdExtended(id: string): Promise<any | null> {
    const query = `
      SELECT 
        i.*, 
        b.name as branch_name, 
        b.address as branch_address, 
        b.phone as branch_phone,
        b.promptpay_id,
        r.room_no,
        t.full_name as tenant_name,
        t.phone as tenant_phone
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      JOIN rooms r ON i.room_id = r.id
      LEFT JOIN leases l ON i.lease_id = l.id
      LEFT JOIN tenants t ON l.tenant_id = t.id
      WHERE i.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByToken(token: string): Promise<any | null> {
    const query = `
      SELECT 
        i.*, b.name as branch_name, b.promptpay_id, r.room_no, t.full_name as tenant_name
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      JOIN rooms r ON i.room_id = r.id
      LEFT JOIN leases l ON i.lease_id = l.id
      LEFT JOIN tenants t ON l.tenant_id = t.id
      WHERE i.payment_token = $1
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  }

  async findItemsByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    const result = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at ASC',
      [invoiceId]
    );
    return result.rows;
  }

  async create(invoice: Partial<Invoice>, items: Partial<InvoiceItem>[]): Promise<Invoice> {
    const { lease_id, room_id, branch_id, invoice_no, total, status } = invoice;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const res = await client.query(
        'INSERT INTO invoices (lease_id, room_id, branch_id, invoice_no, total, status, payment_token) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [lease_id, room_id, branch_id, invoice_no, total, status || 'UNPAID', invoice.payment_token]
      );
      
      const invoiceId = res.rows[0].id;
      
      for (const item of items) {
        await client.query(
          'INSERT INTO invoice_items (invoice_id, item_type, description, quantity, unit, unit_price, amount) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [invoiceId, item.item_type, item.description, item.quantity, item.unit, item.unit_price, item.amount]
        );
      }
      
      await client.query('COMMIT');
      return res.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async findOverdue(days: number): Promise<any[]> {
    const cutoff = subDays(new Date(), days);
    const query = `
      SELECT i.*, t.email as tenant_email
      FROM invoices i
      LEFT JOIN leases l ON i.lease_id = l.id
      LEFT JOIN tenants t ON l.tenant_id = t.id
      WHERE i.status = 'UNPAID' AND i.created_at < $1
    `;
    const result = await pool.query(query, [cutoff]);
    return result.rows;
  }
}
