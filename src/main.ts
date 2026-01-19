import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';
import pool from './config/database';

import branchRoutes from './routes/branchRoutes';
import roomRoutes from './routes/roomRoutes';
import tenantRoutes from './routes/tenantRoutes';
import leaseRoutes from './routes/leaseRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import dailyStayRoutes from './routes/dailyStayRoutes';
import authRoutes from './routes/authRoutes';
import meterRoutes from './routes/meterRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reportRoutes from './routes/reportRoutes';
import publicRoutes from './routes/publicRoutes';
import { InvoiceService } from './services/invoiceService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(globalLimiter);

// Strict limiter for Auth and Payments
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Security alert: Too many attempts. Please try again in an hour.'
});

// Routes
app.use('/api/v1/auth', strictLimiter, authRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/leases', leaseRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/daily-stays', dailyStayRoutes);
app.use('/api/v1/meters', meterRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/', strictLimiter, publicRoutes);

// Health Check
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'Connected' });
  } catch (err) {
    res.status(500).json({ status: 'Error', database: 'Disconnected', error: err });
  }
});

// Schedule monthly invoice generation on the 1st of each month at midnight
cron.schedule('0 0 1 * *', async () => {
  try {
    const invoiceService = new InvoiceService();
    const count = await invoiceService.generateMonthlyInvoices();
    console.log(`Generated ${count} invoices for the month.`);
  } catch (error) {
    console.error('Error generating monthly invoices:', error);
  }
});

// Schedule weekly overdue reminders every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  try {
    const invoiceService = new InvoiceService();
    const count = await invoiceService.sendOverdueReminders(7);
    console.log(`Sent overdue reminders to ${count} tenants.`);
  } catch (error) {
    console.error('Error sending overdue reminders:', error);
  }
});

app.listen(port, () => {
  console.log(`RentCore Server is running on port ${port}`);
});
