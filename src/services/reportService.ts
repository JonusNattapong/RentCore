import { ReportRepository } from '../repositories/reportRepository';

const reportRepository = new ReportRepository();

export class ReportService {
  async getDashboardSummary(branchId?: string) {
    const occupancy = await reportRepository.getOccupancyStatus(branchId);
    const now = new Date();
    const revenue = await reportRepository.getMonthlyRevenue(now.getFullYear(), now.getMonth() + 1, branchId);
    const performance = await reportRepository.getCollectionPerformance(branchId);

    return {
      occupancy,
      revenue,
      performance
    };
  }

  async getRevenueReport(year: number, month: number, branchId?: string) {
    return await reportRepository.getMonthlyRevenue(year, month, branchId);
  }
}
