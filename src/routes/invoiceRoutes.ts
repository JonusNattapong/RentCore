import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', invoiceController.getInvoices);
router.post('/generate', invoiceController.generateInvoices);
router.get('/:id/pdf', invoiceController.downloadInvoicePDF);

export default router;
