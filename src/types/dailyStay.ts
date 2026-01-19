export interface DailyStay {
  id: string;
  room_id: string;
  tenant_id: string;
  branch_id: string;
  check_in_at: Date;
  check_out_at: Date;
  nights: number;
  price_per_night: number;
  total_amount: number;
  status: 'RESERVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  created_at: Date;
  updated_at: Date;
}
