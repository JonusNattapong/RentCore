import { Request, Response } from 'express';
import fs from 'fs';
import { PaymentService } from '../services/paymentService';

const paymentService = new PaymentService();

export const uploadSlip = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { invoice_id, branch_id, amount, method, tenant_id_bypass } = req.body;
    const tenant_id = (req as any).user?.id || tenant_id_bypass;

    const payment = await paymentService.uploadSlip({
      invoice_id,
      branch_id,
      tenant_id,
      amount: parseFloat(amount),
      method,
      filePath: req.file.path,
      originalName: req.file.originalname
    });

    return res.status(201).json(payment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createCounterPayment = async (req: Request, res: Response) => {
  try {
    const { invoice_id, branch_id, tenant_id, amount, method, reference_no, note } = req.body;
    const received_by_user_id = (req as any).user?.id;

    const payment = await paymentService.recordCounterPayment({
      invoice_id,
      branch_id,
      tenant_id,
      received_by_user_id,
      amount: parseFloat(amount),
      method,
      reference_no,
      note
    });

    return res.status(201).json(payment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const payment = await paymentService.confirmPayment(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    return res.json(payment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const rejectPayment = async (req: Request, res: Response) => {
  try {
    const payment = await paymentService.rejectPayment(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    return res.json(payment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getPendingPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await paymentService.getPendingPayments();
    return res.json(payments);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSlipImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentWithSlip(id);
    
    if (!payment || !payment.file_url) {
      return res.status(404).json({ error: 'Slip not found' });
    }

    const path = require('path');
    const absolutePath = path.resolve(payment.file_url);
    
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    return res.sendFile(absolutePath);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
