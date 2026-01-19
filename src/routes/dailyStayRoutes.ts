import { Router } from 'express';
import * as dailyStayController from '../controllers/dailyStayController';
import { authenticate } from '../middleware/authMiddleware';
import { auditLog } from '../middleware/auditMiddleware';

const router = Router();

router.use(authenticate);

router.get('/availability', dailyStayController.getAvailableRooms);
router.post('/book', auditLog('CREATE', 'DAILY_STAY'), dailyStayController.bookStay);
router.post('/:id/check-in', auditLog('UPDATE', 'DAILY_STAY'), dailyStayController.checkIn);
router.post('/:id/check-out', auditLog('UPDATE', 'DAILY_STAY'), dailyStayController.checkOut);

export default router;
