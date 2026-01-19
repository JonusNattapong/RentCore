import { TenantRepository } from '../repositories/tenantRepository';
import { Tenant } from '../types';

const tenantRepository = new TenantRepository();

export class TenantService {
  async getAllTenants(): Promise<Tenant[]> {
    return await tenantRepository.findAll();
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    return await tenantRepository.findById(id);
  }

  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    if (!data.full_name) {
      throw new Error('Full name is required');
    }
    return await tenantRepository.create(data);
  }

  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant | null> {
    return await tenantRepository.update(id, data);
  }
}
