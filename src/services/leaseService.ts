import { LeaseRepository } from '../repositories/leaseRepository';
import { Lease } from '../types';

const leaseRepository = new LeaseRepository();

export class LeaseService {
  async getAllLeases(branchId?: string): Promise<Lease[]> {
    return await leaseRepository.findAll(branchId);
  }

  async getLeaseById(id: string): Promise<Lease | null> {
    return await leaseRepository.findById(id);
  }

  async createLease(data: Partial<Lease>): Promise<Lease> {
    if (!data.room_id || !data.tenant_id || !data.branch_id || !data.start_date || data.rent_monthly === undefined) {
      throw new Error('Missing required lease fields');
    }
    return await leaseRepository.create(data);
  }

  async terminateLease(id: string): Promise<Lease | null> {
    return await leaseRepository.updateStatus(id, 'ENDED');
  }
}
