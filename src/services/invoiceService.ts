import crypto from 'crypto';
import { InvoiceRepository, InvoiceItem } from '../repositories/invoiceRepository';
import { LeaseRepository } from '../repositories/leaseRepository';
import { MeterRepository } from '../repositories/meterRepository';
import { BranchRepository } from '../repositories/branchRepository';
import { MailService } from './mailService';

const invoiceRepository = new InvoiceRepository();
const leaseRepository = new LeaseRepository();
const meterRepository = new MeterRepository();
const branchRepository = new BranchRepository();
const mailService = new MailService();

export class InvoiceService {
  async generateMonthlyInvoices(): Promise<number> {
    const activeLeases = await leaseRepository.findAllWithTenants();
    let count = 0;
    
    for (const lease of activeLeases) {
      const branchList = await branchRepository.findAll();
      const currentBranch = branchList.find(b => b.id === lease.branch_id);
      
      const items: Partial<InvoiceItem>[] = [];
      
      // 1. Rent
      items.push({
        item_type: 'RENT',
        description: 'Monthly Rent',
        quantity: 1,
        unit: 'Month',
        unit_price: lease.rent_monthly,
        amount: lease.rent_monthly
      });
      
      // 2. Electricity
      const lastElectric = await meterRepository.findLastByRoom(lease.room_id, 'ELECTRIC');
      if (lastElectric) {
        const rate = currentBranch?.electric_rate || 7;
        items.push({
          item_type: 'ELECTRIC',
          description: `Electricity (${lastElectric.previous_value} - ${lastElectric.current_value})`,
          quantity: lastElectric.consumed,
          unit: 'Unit',
          unit_price: rate,
          amount: lastElectric.consumed * rate
        });
      }
      
      // 3. Water
      const lastWater = await meterRepository.findLastByRoom(lease.room_id, 'WATER');
      if (lastWater) {
        const rate = currentBranch?.water_rate || 15;
        items.push({
          item_type: 'WATER',
          description: `Water (${lastWater.previous_value} - ${lastWater.current_value})`,
          quantity: lastWater.consumed,
          unit: 'Unit',
          unit_price: rate,
          amount: lastWater.consumed * rate
        });
      }
      
      const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const invoiceNo = `INV-${lease.branch_id.slice(0,4)}-${Date.now()}-${count}`;
      const paymentToken = crypto.randomBytes(32).toString('hex');
      
      const invoice = await invoiceRepository.create({
        lease_id: lease.id,
        room_id: lease.room_id,
        branch_id: lease.branch_id,
        invoice_no: invoiceNo,
        total: total,
        status: 'UNPAID',
        payment_token: paymentToken
      }, items);

      // Trigger Email Notification
      if (lease.tenant_email) {
        mailService.sendInvoiceNotification(lease.tenant_email, invoice.invoice_no, total)
          .catch(err => console.error('Email failed:', err));
      }
      
      count++;
    }
    
    return count;
  }

  async getInvoices(branchId?: string) {
    return await invoiceRepository.findAll(branchId);
  }

  async getInvoiceById(id: string) {
    return await invoiceRepository.findByIdExtended(id);
  }

  async getInvoiceItems(invoiceId: string) {
    return await invoiceRepository.findItemsByInvoiceId(invoiceId);
  }

  async sendOverdueReminders(days: number = 7): Promise<number> {
    const overdueInvoices = await invoiceRepository.findOverdue(days);
    let count = 0;

    for (const invoice of overdueInvoices) {
      if (invoice.tenant_email) {
        mailService.sendOverdueReminder(invoice.tenant_email, invoice.invoice_no, invoice.total)
          .catch((err: any) => console.error('Email failed:', err));
        count++;
      }
    }

    return count;
  }

  async getInvoiceByToken(token: string) {
    return await invoiceRepository.findByToken(token);
  }
}
