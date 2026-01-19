export interface Payment {
  id: string;
  invoice_id: string;
  branch_id: string;
  tenant_id?: string;
  received_by_user_id?: string;
  amount: number;
  method: 'CASH' | 'TRANSFER' | 'CREDIT_CARD' | 'QR_PROMPTPAY' | 'OTHER';
  reference_no?: string;
  note?: string;
  paid_at: Date;
  status: 'SUBMITTED' | 'CONFIRMED' | 'REJECTED';
  created_at: Date;
  updated_at: Date;
}

export interface PaymentSlip {
  id: string;
  payment_id: string;
  file_url: string;
  file_hash: string;
  transaction_ref?: string;
  original_filename?: string;
  uploaded_at: Date;
}
