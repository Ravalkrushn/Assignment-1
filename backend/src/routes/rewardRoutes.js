import express from 'express';
import {
  getRewards,
  getRewardById,
  claimReward,
  createReward,
  updateReward,
  deleteReward
} from '../controllers/rewardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  createRewardValidator,
  updateRewardValidator
} from '../validators/rewardValidators.js';

const router = express.Router();

router.get('/', getRewards);
router.get('/:id', getRewardById);
router.post('/:id/redeem', protect, claimReward);

// Admin-only operations
router.post('/', protect, restrictTo('admin'), createRewardValidator, validateRequest, createReward);
router.put('/:id', protect, restrictTo('admin'), updateRewardValidator, validateRequest, updateReward);
router.delete('/:id', protect, restrictTo('admin'), deleteReward);

export default router;
