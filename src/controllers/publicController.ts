import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoiceService';
import { QRService } from '../services/qrService';

const invoiceService = new InvoiceService();
const qrService = new QRService();

export const getPublicInvoice = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    const invoice = await invoiceService.getInvoiceByToken(token);
    
    if (!invoice) {
       return res.status(404).send('<h1>Invoice Not Found</h1>');
    }

    const items = await invoiceService.getInvoiceItems(invoice.id);
    
    let qrHtml = '';
    if (invoice.promptpay_id && invoice.status === 'UNPAID') {
      const qrDataUrl = await qrService.generatePromptPayQR(invoice.promptpay_id, Number(invoice.total));
      qrHtml = `<img src="${qrDataUrl}" width="200" style="border: 4px solid #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">`;
    }

    const itemsHtml = items.map(item => `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
        <span>${item.description}</span>
        <span style="font-weight: 600;">${Number(item.amount).toLocaleString()} THB</span>
      </div>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoice_no} | RentCore</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .card { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); padding: 32px; }
        .header { text-align: center; margin-bottom: 32px; }
        .branch-name { font-size: 20px; font-weight: 700; color: #3b82f6; margin: 0; }
        .invoice-no { font-size: 14px; color: #64748b; margin-top: 4px; }
        .amount-section { background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .amount-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        .amount-value { font-size: 32px; font-weight: 800; color: #1e293b; }
        .qr-card { text-align: center; margin-top: 24px; }
        .upload-section { margin-top: 32px; border-top: 2px dashed #e2e8f0; padding-top: 24px; }
        .btn { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; display: block; width: 100%; text-decoration: none; text-align: center; }
        .btn:hover { background: #2563eb; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
        .status-unpaid { background: #fee2e2; color: #ef4444; }
        .status-paid { background: #dcfce7; color: #22c55e; }
      </style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap">
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="status status-${invoice.status.toLowerCase()}">${invoice.status}</div>
          <h1 class="branch-name">${invoice.branch_name}</h1>
          <div class="invoice-no">${invoice.invoice_no}</div>
        </div>

        <div class="amount-section">
          <div class="amount-label">Total Amount Due</div>
          <div class="amount-value">${Number(invoice.total).toLocaleString()} THB</div>
        </div>

        <div>
          <h3 style="font-size: 16px; margin-bottom: 12px;">Billing Details</h3>
          ${itemsHtml}
        </div>

        ${invoice.status === 'UNPAID' ? `
          <div class="qr-card">
            <p style="font-size: 14px; margin-bottom: 16px; color: #64748b;">Scan to pay with PromptPay</p>
            ${qrHtml}
            <p style="font-size: 12px; margin-top: 12px; font-family: monospace;">PP ID: ${invoice.promptpay_id}</p>
          </div>

          <div class="upload-section">
            <h3 style="font-size: 16px; margin-bottom: 16px;">Already paid? Upload Slip</h3>
            <form action="/api/v1/payments/upload-public" method="POST" enctype="multipart/form-data">
              <input type="hidden" name="payment_token" value="${token}">
              <input type="hidden" name="invoice_id" value="${invoice.id}">
              <input type="hidden" name="branch_id" value="${invoice.branch_id}">
              <input type="hidden" name="amount" value="${invoice.total}">
              <input type="file" name="slip" required style="margin-bottom: 16px; display: block; width: 100%;">
              <button type="submit" class="btn">Submit Payment</button>
            </form>
          </div>
        ` : `
          <div style="text-align: center; margin-top: 32px; color: #22c55e; font-weight: 700;">
            <svg style="width: 48px; height: 48px; margin-bottom: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 1118 0z"></path>
            </svg>
            <div>PAYMENT COMPLETE</div>
          </div>
        `}
      </div>
    </body>
    </html>
    `;
    
    return res.send(html);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
