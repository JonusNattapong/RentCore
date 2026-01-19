import pool from '../config/database';
import { Payment, PaymentSlip } from '../types';

export class PaymentRepository {
  async createPayment(data: Partial<Payment>): Promise<Payment> {
    const { 
      invoice_id, 
      branch_id, 
      tenant_id, 
      received_by_user_id, 
      amount, 
      method, 
      reference_no, 
      note, 
      paid_at, 
      status 
    } = data;
    
    const result = await pool.query(
      `INSERT INTO payments (
        invoice_id, branch_id, tenant_id, received_by_user_id, 
        amount, method, reference_no, note, paid_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        invoice_id, branch_id, tenant_id, received_by_user_id, 
        amount, method || 'TRANSFER', reference_no, note, 
        paid_at || new Date(), status || 'SUBMITTED'
      ]
    );
    return result.rows[0];
  }

  async createSlip(data: Partial<PaymentSlip>): Promise<PaymentSlip> {
    const { payment_id, file_url, file_hash, transaction_ref, original_filename } = data;
    const result = await pool.query(
      'INSERT INTO payment_slips (payment_id, file_url, file_hash, transaction_ref, original_filename) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [payment_id, file_url, file_hash, transaction_ref, original_filename]
    );
    return result.rows[0];
  }

  async findSlipByTransRef(ref: string): Promise<PaymentSlip | null> {
    const result = await pool.query('SELECT * FROM payment_slips WHERE transaction_ref = $1', [ref]);
    return result.rows[0] || null;
  }

  async findSlipByHash(hash: string): Promise<PaymentSlip | null> {
    const result = await pool.query('SELECT * FROM payment_slips WHERE file_hash = $1', [hash]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<Payment | null> {
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async updateStatus(id: string, status: string): Promise<Payment | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const res = await client.query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );
      
      if (status === 'CONFIRMED' && res.rows[0]) {
        await client.query(
          "UPDATE invoices SET status = 'PAID', is_locked = true WHERE id = $1",
          [res.rows[0].invoice_id]
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

  async findWithDetails(id: string): Promise<any | null> {
    const query = `
      SELECT p.*, t.email as tenant_email, i.invoice_no, ps.file_url 
      FROM payments p
      LEFT JOIN tenants t ON p.tenant_id = t.id
      JOIN invoices i ON p.invoice_id = i.id
      LEFT JOIN payment_slips ps ON p.id = ps.payment_id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const result = await pool.query('SELECT * FROM payments WHERE invoice_id = $1', [invoiceId]);
    return result.rows;
  }

  async findPendingWithDetails(): Promise<any[]> {
    const query = `
      SELECT p.*, t.first_name || ' ' || t.last_name as tenant_name, i.invoice_no, i.total, ps.transaction_ref, ps.file_url
      FROM payments p
      LEFT JOIN tenants t ON p.tenant_id = t.id
      JOIN invoices i ON p.invoice_id = i.id
      LEFT JOIN payment_slips ps ON p.id = ps.payment_id
      WHERE p.status = 'SUBMITTED'
      ORDER BY p.created_at ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}
