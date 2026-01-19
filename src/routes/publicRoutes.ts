import { Router } from 'express';
import * as publicController from '../controllers/publicController';
import * as paymentController from '../controllers/paymentController';
import { upload } from '../utils/upload';

const router = Router();

// Publicly accessible pay link
router.get('/p/:token', publicController.getPublicInvoice);

// Public upload (verified by token/id in body, not JWT)
router.post('/payments/upload-public', upload.single('slip'), paymentController.uploadSlip);

export default router;
