import { RoomRepository } from '../repositories/roomRepository';
import { Room } from '../types';

const roomRepository = new RoomRepository();

export class RoomService {
  async getAllRooms(branchId?: string): Promise<Room[]> {
    return await roomRepository.findAll(branchId);
  }

  async getRoomById(id: string): Promise<Room | null> {
    return await roomRepository.findById(id);
  }

  async createRoom(data: Partial<Room>): Promise<Room> {
    if (!data.branch_id || !data.floor_id || !data.room_no) {
      throw new Error('Branch ID, Floor ID, and Room number are required');
    }
    return await roomRepository.create(data);
  }

  async updateRoom(id: string, data: Partial<Room>): Promise<Room | null> {
    return await roomRepository.update(id, data);
  }
}
