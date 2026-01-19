import { DailyStayRepository } from '../repositories/dailyStayRepository';
import { DailyStay, Room } from '../types';

const dailyStayRepository = new DailyStayRepository();

export class DailyStayService {
  async getAvailableRooms(branchId: string, checkIn: Date, checkOut: Date): Promise<Room[]> {
    return await dailyStayRepository.findAvailable(branchId, checkIn, checkOut);
  }

  async bookStay(data: Partial<DailyStay>): Promise<DailyStay> {
    if (!data.room_id || !data.tenant_id || !data.branch_id || !data.check_in_at || !data.check_out_at) {
      throw new Error('Missing required booking fields');
    }
    
    // Calculate nights if not provided
    if (!data.nights) {
      const start = new Date(data.check_in_at);
      const end = new Date(data.check_out_at);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      data.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    if (data.nights <= 0) throw new Error('Check-out must be after check-in');
    
    return await dailyStayRepository.create(data);
  }

  async checkIn(id: string): Promise<DailyStay | null> {
    return await dailyStayRepository.updateStatus(id, 'CHECKED_IN');
  }

  async checkOut(id: string): Promise<DailyStay | null> {
    const stay = await dailyStayRepository.updateStatus(id, 'CHECKED_OUT');
    if (stay) {
      // Logic to free the room could be added here or in repository
      // For now, let's assume we update room status to VACANT here if needed
    }
    return stay;
  }
}
