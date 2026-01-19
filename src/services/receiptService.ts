import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class ReceiptService {
  async generateReceipt(data: {
    receiptNo: string;
    date: Date;
    tenantName: string;
    branchName: string;
    branchAddress: string;
    amount: number;
    amountThai: string;
    description: string;
    paymentMethod: string;
  }): Promise<string> {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `receipt_${data.receiptNo}.pdf`;
    const filePath = path.join(__dirname, '../../uploads/receipts', fileName);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('RECEIPT / ใบเสร็จรับเงิน', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Branch: ${data.branchName}`, { align: 'left' });
    doc.text(`Address: ${data.branchAddress}`, { align: 'left' });
    doc.moveUp();
    doc.text(`No: ${data.receiptNo}`, { align: 'right' });
    doc.text(`Date: ${data.date.toLocaleDateString('th-TH')}`, { align: 'right' });
    doc.moveDown(2);

    // Content Table Header
    doc.rect(50, doc.y, 500, 20).fill('#f1f5f9');
    doc.fillColor('#1e293b').text('Description', 60, doc.y + 5);
    doc.text('Amount (THB)', 450, doc.y, { align: 'right' });
    doc.moveDown();

    // Line items
    doc.text(data.description, 60, doc.y + 10);
    doc.text(data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }), 450, doc.y, { align: 'right' });
    doc.moveDown(2);

    // Total
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(12).text('Total Amount:', 350);
    doc.text(`${data.amount.toLocaleString()} THB`, 450, doc.y, { align: 'right' });
    
    doc.fontSize(10).text(`Amount in words: (${data.amountThai})`, 60, doc.y);
    doc.moveDown(3);

    // Footer
    doc.text('Authorized Signature', 400, doc.y, { align: 'center' });
    doc.moveTo(350, doc.y + 15).lineTo(550, doc.y + 15).stroke();

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }
}
