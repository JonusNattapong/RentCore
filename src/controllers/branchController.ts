import { Request, Response } from 'express';
import { BranchService } from '../services/branchService';

const branchService = new BranchService();

export const getBranches = async (_req: Request, res: Response) => {
  try {
    const branches = await branchService.getAllBranches();
    return res.json(branches);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getBranchById = async (req: Request, res: Response) => {
  try {
    const branch = await branchService.getBranchById(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    return res.json(branch);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const branch = await branchService.createBranch(req.body);
    return res.status(201).json(branch);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  try {
    const branch = await branchService.updateBranch(req.params.id, req.body);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    return res.json(branch);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
