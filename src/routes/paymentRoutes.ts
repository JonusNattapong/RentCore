import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { auditLog } from '../middleware/auditMiddleware';
import { upload } from '../utils/upload';

const router = Router();

router.use(authenticate);

// Online payment (upload slip)
router.post('/upload', upload.single('slip'), auditLog('CREATE', 'PAYMENT'), paymentController.uploadSlip);

// Counter payment (instant) - only for staff/admin
router.post('/counter', authorize(['PAYMENT_MANAGE']), auditLog('CREATE', 'PAYMENT'), paymentController.createCounterPayment);

router.post('/:id/confirm', auditLog('UPDATE', 'PAYMENT'), paymentController.confirmPayment);
router.post('/:id/reject', auditLog('UPDATE', 'PAYMENT'), paymentController.rejectPayment);
router.get('/pending', authorize(['PAYMENT_MANAGE']), paymentController.getPendingPayments);
router.get('/slips/:id', authenticate, paymentController.getSlipImage);

export default router;
