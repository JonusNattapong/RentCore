export interface Branch {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  water_rate: number;
  electric_rate: number;
  promptpay_id?: string;
  bank_account_no?: string;
  bank_account_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Room {
  id: string;
  floor_id: string;
  branch_id: string;
  room_no: string;
  room_type?: string;
  capacity: number;
  status: 'VACANT' | 'RESERVED' | 'OCCUPIED_MONTHLY' | 'OCCUPIED_DAILY' | 'MAINTENANCE' | 'CLOSED';
  area_sqm?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
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
export interface Lease {
  id: string;
  room_id: string;
  tenant_id: string;
  branch_id: string;
  start_date: Date;
  end_date?: Date;
  rent_monthly: number;
  deposit_amount: number;
  billing_day: number;
  status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  lease_id?: string;
  room_id: string;
  branch_id: string;
  invoice_no: string;
  total: number;
  status: 'UNPAID' | 'WAITING_CONFIRM' | 'PAID' | 'OVERDUE' | 'VOID';
  payment_token?: string;
  is_locked: boolean;
  created_at: Date;
  updated_at: Date;
}

export * from './dailyStay';
export * from './meter';
export * from './payment';
