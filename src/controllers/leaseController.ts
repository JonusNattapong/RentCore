import { Request, Response } from 'express';
import { LeaseService } from '../services/leaseService';

const leaseService = new LeaseService();

export const getLeases = async (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    const leases = await leaseService.getAllLeases(branchId);
    return res.json(leases);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getLeaseById = async (req: Request, res: Response) => {
  try {
    const lease = await leaseService.getLeaseById(req.params.id);
    if (!lease) return res.status(404).json({ error: 'Lease not found' });
    return res.json(lease);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createLease = async (req: Request, res: Response) => {
  try {
    const lease = await leaseService.createLease(req.body);
    return res.status(201).json(lease);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const terminateLease = async (req: Request, res: Response) => {
  try {
    const lease = await leaseService.terminateLease(req.params.id);
    if (!lease) return res.status(404).json({ error: 'Lease not found' });
    return res.json(lease);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
