import { Router } from 'express';
import * as tenantController from '../controllers/tenantController';
import { authenticate } from '../middleware/authMiddleware';
import { auditLog } from '../middleware/auditMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', tenantController.getTenants);
router.get('/:id', tenantController.getTenantById);
router.post('/', auditLog('CREATE', 'TENANT'), tenantController.createTenant);
router.patch('/:id', auditLog('UPDATE', 'TENANT'), tenantController.updateTenant);

export default router;
