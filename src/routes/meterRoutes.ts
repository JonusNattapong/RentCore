import { Router } from 'express';
import * as meterController from '../controllers/meterController';
import { authenticate } from '../middleware/authMiddleware';
import { auditLog } from '../middleware/auditMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', meterController.getReadings);
router.post('/', auditLog('CREATE', 'METER_READING'), meterController.addReading);

export default router;
