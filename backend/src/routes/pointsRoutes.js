import express from 'express';
import {
  getBalance,
  getHistory,
  getPointsSummary,
  getAdminPointsOverview,
  adjustPoints
} from '../controllers/pointsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/balance', protect, getBalance);
router.get('/history', protect, getHistory);
router.get('/summary', protect, getPointsSummary);

// Admin-only endpoints
router.get('/overview', protect, restrictTo('admin'), getAdminPointsOverview);
router.post('/adjust', protect, restrictTo('admin'), adjustPoints);

export default router;
