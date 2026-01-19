import { Request, Response } from 'express';
import { MeterService } from '../services/meterService';

const meterService = new MeterService();

export const addReading = async (req: Request, res: Response) => {
  try {
    const reading = await meterService.addReading(req.body);
    return res.status(201).json(reading);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const getReadings = async (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    const readings = await meterService.getReadings(branchId);
    return res.json(readings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
