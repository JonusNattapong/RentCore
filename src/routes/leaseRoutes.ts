import { Router } from 'express';
import * as leaseController from '../controllers/leaseController';
import { authenticate } from '../middleware/authMiddleware';
import { auditLog } from '../middleware/auditMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', leaseController.getLeases);
router.get('/:id', leaseController.getLeaseById);
router.post('/', auditLog('CREATE', 'LEASE'), leaseController.createLease);
router.post('/:id/terminate', auditLog('UPDATE', 'LEASE'), leaseController.terminateLease);

export default router;
