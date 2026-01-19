import { BranchRepository } from '../repositories/branchRepository';
import { Branch } from '../types';

const branchRepository = new BranchRepository();

export class BranchService {
  async getAllBranches(): Promise<Branch[]> {
    return await branchRepository.findAll();
  }

  async getBranchById(id: string): Promise<Branch | null> {
    return await branchRepository.findById(id);
  }

  async createBranch(data: Partial<Branch>): Promise<Branch> {
    // Basic validation or business logic can be added here
    if (!data.code || !data.name) {
      throw new Error('Branch code and name are required');
    }
    return await branchRepository.create(data);
  }

  async updateBranch(id: string, data: Partial<Branch>): Promise<Branch | null> {
    return await branchRepository.update(id, data);
  }
}
