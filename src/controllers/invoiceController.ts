import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoiceService';
import { PDFService } from '../services/pdfService';

const invoiceService = new InvoiceService();
const pdfService = new PDFService();

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    const invoices = await invoiceService.getInvoices(branchId);
    return res.json(invoices);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const generateInvoices = async (_req: Request, res: Response) => {
  try {
    const count = await invoiceService.generateMonthlyInvoices();
    return res.json({ message: `Successfully generated ${count} invoices` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const downloadInvoicePDF = async (req: Request, res: Response) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const items = await invoiceService.getInvoiceItems(req.params.id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_no}.pdf`);
    
    await pdfService.generateInvoicePDF(invoice, items, res);
    return; // Correctly returning after streaming PDF
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
