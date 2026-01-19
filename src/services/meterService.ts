import { MeterRepository } from '../repositories/meterRepository';
import { MeterReading } from '../types';

const meterRepository = new MeterRepository();

export class MeterService {
  async addReading(data: Partial<MeterReading>): Promise<MeterReading> {
    if (!data.room_id || !data.branch_id || !data.meter_type || data.current_value === undefined) {
      throw new Error('Missing required meter reading fields');
    }

    // Get previous value automatically
    const lastReading = await meterRepository.findLastByRoom(data.room_id, data.meter_type);
    data.previous_value = lastReading ? lastReading.current_value : 0;

    if (data.current_value < data.previous_value) {
      throw new Error('Current value cannot be less than previous value');
    }

    return await meterRepository.create(data);
  }

  async getReadings(branchId?: string): Promise<MeterReading[]> {
    return await meterRepository.findAll(branchId);
  }
}
