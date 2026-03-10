import { Router } from 'express';
import { verifyReceipt, getPublicStats } from '../controllers/audit.controller';

const router = Router();

router.get('/verify/:receiptId', verifyReceipt);
router.get('/stats', getPublicStats);

export default router;