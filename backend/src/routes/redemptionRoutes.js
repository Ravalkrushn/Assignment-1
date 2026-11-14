import express from 'express';
import {
  getMyRedemptions,
  getRedemptionById,
  getAdminRedemptions
} from '../controllers/redemptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyRedemptions);
router.get('/:id', protect, getRedemptionById);

// Admin master ledger
router.get('/', protect, restrictTo('admin'), getAdminRedemptions);

export default router;
