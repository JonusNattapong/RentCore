import { Router } from 'express';
import * as branchController from '../controllers/branchController';
import { authenticate } from '../middleware/authMiddleware';
import { auditLog } from '../middleware/auditMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', branchController.getBranches);
router.get('/:id', branchController.getBranchById);
router.post('/', auditLog('CREATE', 'BRANCH'), branchController.createBranch);
router.patch('/:id', auditLog('UPDATE', 'BRANCH'), branchController.updateBranch);

export default router;
