import { Request, Response } from 'express';
import { ReportService } from '../services/reportService';

const reportService = new ReportService();

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    const summary = await reportService.getDashboardSummary(branchId);
    return res.json(summary);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const { year, month, branchId } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and Month are required' });
    }
    const report = await reportService.getRevenueReport(
      parseInt(year as string),
      parseInt(month as string),
      branchId as string
    );
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
