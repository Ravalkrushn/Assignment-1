import express from 'express';
import {
  getFraudLogs,
  getFraudLogById,
  updateFraudStatus,
  blockIp,
  unblockIp
} from '../controllers/fraudController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/', getFraudLogs);
router.get('/:id', getFraudLogById);
router.patch('/:id/status', updateFraudStatus);
router.post('/block-ip', blockIp);
router.post('/unblock-ip', unblockIp);

export default router;
