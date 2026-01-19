import crypto from 'crypto';
import fs from 'fs';
import { PaymentRepository } from '../repositories/paymentRepository';
import { InvoiceRepository } from '../repositories/invoiceRepository';
import { BranchRepository } from '../repositories/branchRepository';
import { Payment } from '../types';
import { MailService } from './mailService';
import { SlipVerificationService } from './slipVerificationService';
import { ReceiptService } from './receiptService';
import { amountToThaiWords } from '../utils/thaiUtils';
import pool from '../config/database';

const paymentRepository = new PaymentRepository();
const invoiceRepository = new InvoiceRepository();
const branchRepository = new BranchRepository();
const mailService = new MailService();
const slipVerifier = new SlipVerificationService();
const receiptService = new ReceiptService();

export class PaymentService {
  // 1. Website/Slip Upload Payment
  async uploadSlip(data: {
    invoice_id: string;
    branch_id: string;
    tenant_id?: string;
    amount: number;
    method?: any;
    filePath: string;
    originalName: string;
  }) {
    const fileBuffer = fs.readFileSync(data.filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Anti-Cheat 1: Check for duplicate file hash
    const existingSlipByHash = await paymentRepository.findSlipByHash(hash);
    if (existingSlipByHash) {
      throw new Error('This exact file has already been uploaded.');
    }

    // Anti-Cheat 2: OCR & QR Scanning (Self-hosted)
    const verification = await slipVerifier.verify(data.filePath);
    if (!verification.success) {
      throw new Error(`Invalid Slip: ${verification.message}`);
    }

    // Anti-Cheat 3: Duplicate Transaction Ref
    const transRef = verification.data?.transRef;
    if (transRef) {
      const existingRef = await paymentRepository.findSlipByTransRef(transRef);
      if (existingRef) {
        throw new Error('This transaction has already been used to pay.');
      }
    }

    // Anti-Cheat 4: OCR Validation (Amount, Bank Acc, Name)
    const invoice = await invoiceRepository.findByIdExtended(data.invoice_id);
    if (!invoice) throw new Error('Invoice not found');

    // Fetch Branch Bank Details
    const branch = await branchRepository.findById(data.branch_id);
    if (!branch) throw new Error('Branch not found');

    const ocrData = verification.data;
    const ocrAmount = ocrData?.amount;
    const ocrText = ocrData?.ocrText || '';

    // A. Check Amount (OCR vs Invoice)
    if (ocrAmount && ocrAmount < Number(invoice.total)) {
      throw new Error(`Slip amount (${ocrAmount}) is less than required (${invoice.total})`);
    }

    // B. Check Bank Account (If branch has one configured)
    if (branch.bank_account_no) {
      const cleanBranchAcc = branch.bank_account_no.replace(/-/g, '');
      if (ocrData?.receiverAccountNo && !ocrData.receiverAccountNo.includes(cleanBranchAcc.slice(-4))) {
        throw new Error(`Bank account on slip does not match branch account.`);
      }
    }

    // C. Check Bank Name (Keyword match)
    if (branch.bank_account_name) {
      const nameParts = branch.bank_account_name.split(' ');
      const foundMatch = nameParts.some(part => ocrText.includes(part));
      if (!foundMatch) {
         // Log warning or throw error
         console.warn('Bank name not found on slip text');
      }
    }

    const payment = await paymentRepository.createPayment({
      invoice_id: data.invoice_id,
      branch_id: data.branch_id,
      tenant_id: data.tenant_id,
      amount: ocrAmount || data.amount, // Prefer OCR amount if detected
      method: data.method || 'TRANSFER',
      status: 'SUBMITTED',
      note: `OCR Detected: ${ocrAmount} THB. Ref: ${transRef ? transRef.slice(0, 10) : 'N/A'}`
    });

    await paymentRepository.createSlip({
      payment_id: payment.id,
      file_url: data.filePath,
      file_hash: hash,
      transaction_ref: transRef,
      original_filename: data.originalName
    });

    await pool.query('UPDATE invoices SET status = $1 WHERE id = $2', ['WAITING_CONFIRM', data.invoice_id]);

    return payment;
  }

  // 2. Counter Payment (Instant Confirmation)
  async recordCounterPayment(data: {
    invoice_id: string;
    branch_id: string;
    tenant_id?: string;
    received_by_user_id: string;
    amount: number;
    method: 'CASH' | 'TRANSFER' | 'CREDIT_CARD' | 'QR_PROMPTPAY';
    reference_no?: string;
    note?: string;
  }) {
    const invoice = await invoiceRepository.findById(data.invoice_id);
    if (!invoice) throw new Error('Invoice not found');
    if (data.amount < Number(invoice.total)) {
      throw new Error(`Insufficient amount. Expected: ${invoice.total}, Got: ${data.amount}`);
    }

    const payment = await paymentRepository.createPayment({
      ...data,
      status: 'CONFIRMED',
      paid_at: new Date()
    });

    await paymentRepository.updateStatus(payment.id, 'CONFIRMED');

    const details = await paymentRepository.findWithDetails(payment.id);
    if (details?.tenant_email) {
      mailService.sendPaymentConfirmation(details.tenant_email, details.invoice_no)
        .catch(err => console.error('Email failed:', err));
    }

    return payment;
  }

  async confirmPayment(paymentId: string): Promise<Payment | null> {
    const payment = await paymentRepository.updateStatus(paymentId, 'CONFIRMED');
    
    if (payment) {
      const details = await paymentRepository.findWithDetails(paymentId);
      const branch = await branchRepository.findById(payment.branch_id);

      if (details) {
        // Generate PDF Receipt
        try {
          const receiptNo = `REC-${details.invoice_no}-${Date.now().toString().slice(-4)}`;
          const pdfPath = await receiptService.generateReceipt({
            receiptNo,
            date: new Date(),
            tenantName: details.tenant_name || 'N/A',
            branchName: branch?.name || 'N/A',
            branchAddress: branch?.address || '',
            amount: Number(payment.amount),
            amountThai: amountToThaiWords(Number(payment.amount)),
            description: `Payment for Invoice #${details.invoice_no}`,
            paymentMethod: payment.method
          });
          
          console.log(`Receipt generated: ${pdfPath}`);
          // In a real system, you'd save the receipt path to the database
        } catch (err) {
          console.error('Receipt generation failed:', err);
        }

        if (details.tenant_email) {
          mailService.sendPaymentConfirmation(details.tenant_email, details.invoice_no)
            .catch(err => console.error('Email failed:', err));
        }
      }
    }
    
    return payment;
  }

  async rejectPayment(paymentId: string): Promise<Payment | null> {
    return await paymentRepository.updateStatus(paymentId, 'REJECTED');
  }

  async getPendingPayments() {
    return await paymentRepository.findPendingWithDetails();
  }

  async getPaymentWithSlip(paymentId: string) {
    return await paymentRepository.findWithDetails(paymentId);
  }

  async getPaymentsByInvoice(invoiceId: string) {
    return await paymentRepository.findByInvoiceId(invoiceId);
  }
}
