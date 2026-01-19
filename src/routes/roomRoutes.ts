import { Router } from 'express';
import * as roomController from '../controllers/roomController';
import { authenticate } from '../middleware/authMiddleware';
import { auditLog } from '../middleware/auditMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', auditLog('CREATE', 'ROOM'), roomController.createRoom);
router.patch('/:id', auditLog('UPDATE', 'ROOM'), roomController.updateRoom);

export default router;
