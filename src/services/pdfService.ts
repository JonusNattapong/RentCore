import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { QRService } from './qrService';

const qrService = new QRService();

export class PDFService {
  async generateInvoicePDF(invoice: any, items: any[], res: Response) {
    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF directly to the response
    doc.pipe(res);

    // --- Header ---
    doc
      .fontSize(20)
      .text('INVOICE / RECEIPT', { align: 'right' })
      .fontSize(10)
      .text(`Invoice No: ${invoice.invoice_no}`, { align: 'right' })
      .text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, { align: 'right' })
      .moveDown();

    // --- Branch Info ---
    doc
      .fontSize(12)
      .text(invoice.branch_name) 
      .fontSize(10)
      .text(invoice.branch_address || '')
      .text(`Phone: ${invoice.branch_phone || 'N/A'}`)
      .moveDown();

    // --- Tenant Info ---
    doc
      .fontSize(12)
      .text('Bill To:', { underline: true })
      .fontSize(10)
      .text(`Name: ${invoice.tenant_name || 'N/A'}`)
      .text(`Room: ${invoice.room_no}`)
      .text(`Phone: ${invoice.tenant_phone || 'N/A'}`)
      .moveDown(2);

    // --- Table Header ---
    const tableTop = 250;
    doc
      .fontSize(10)
      .text('Description', 50, tableTop)
      .text('Qty', 280, tableTop, { width: 50, align: 'right' })
      .text('Unit Price', 330, tableTop, { width: 90, align: 'right' })
      .text('Total', 420, tableTop, { width: 90, align: 'right' });

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(560, tableTop + 15)
      .stroke();

    // --- Table Items ---
    let i = 0;
    items.forEach((item) => {
      const y = tableTop + 30 + i * 25;
      doc
        .fontSize(10)
        .text(item.description, 50, y)
        .text(item.quantity.toString(), 280, y, { width: 50, align: 'right' })
        .text(Number(item.unit_price).toFixed(2), 330, y, { width: 90, align: 'right' })
        .text(Number(item.amount).toFixed(2), 420, y, { width: 90, align: 'right' });
      i++;
    });

    // --- Total ---
    const totalY = tableTop + 40 + i * 25;
    doc
      .moveTo(50, totalY)
      .lineTo(560, totalY)
      .stroke()
      .moveDown()
      .fontSize(14)
      .text(`Grand Total: ${Number(invoice.total).toFixed(2)} THB`, { align: 'right' })
      .moveDown();

    // --- QR Code Section ---
    if (invoice.promptpay_id && invoice.status === 'UNPAID') {
      try {
        const qrDataUrl = await qrService.generatePromptPayQR(invoice.promptpay_id, Number(invoice.total));
        // Base64 to Buffer
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        
        doc.fontSize(12).text('Scan to Pay (PromptPay):', 50, totalY + 30);
        doc.image(qrBuffer, 50, totalY + 50, { width: 120 });
        doc.fontSize(8).text(`PromptPay ID: ${invoice.promptpay_id}`, 50, totalY + 175);
      } catch (err) {
        console.error('Failed to add QR to PDF:', err);
      }
    }

    // --- Footer ---
    doc
      .fontSize(10)
      .text('Thank you for your business!', 50, 720, { align: 'center', width: 500 });

    doc.end();
  }
}
