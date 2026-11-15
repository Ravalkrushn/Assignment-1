import express from 'express';
import {
  getMyRedemptions,
  getRedemptionById,
  getAdminRedemptions,
  updateFulfillmentStatus
} from '../controllers/redemptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyRedemptions);
router.get('/:id', protect, getRedemptionById);

// Admin fulfillment & master ledger
router.get('/', protect, restrictTo('admin'), getAdminRedemptions);
router.patch('/:id/fulfillment', protect, restrictTo('admin'), updateFulfillmentStatus);

export default router;
