export interface MeterReading {
  id: string;
  room_id: string;
  branch_id: string;
  meter_type: 'WATER' | 'ELECTRIC';
  previous_value: number;
  current_value: number;
  consumed: number;
  reading_date: Date;
  created_at: Date;
}
