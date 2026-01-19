import { Request, Response } from 'express';
import { TenantService } from '../services/tenantService';

const tenantService = new TenantService();

export const getTenants = async (_req: Request, res: Response) => {
  try {
    const tenants = await tenantService.getAllTenants();
    return res.json(tenants);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getTenantById = async (req: Request, res: Response) => {
  try {
    const tenant = await tenantService.getTenantById(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    return res.json(tenant);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createTenant = async (req: Request, res: Response) => {
  try {
    const tenant = await tenantService.createTenant(req.body);
    return res.status(201).json(tenant);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateTenant = async (req: Request, res: Response) => {
  try {
    const tenant = await tenantService.updateTenant(req.params.id, req.body);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    return res.json(tenant);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
