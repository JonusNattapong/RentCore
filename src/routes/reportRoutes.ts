import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// dashboard and revenue reports usually for owners/managers
router.get('/dashboard', authorize(['REPORT_VIEW']), reportController.getDashboardSummary);
router.get('/revenue', authorize(['REPORT_VIEW']), reportController.getRevenueReport);

export default router;
