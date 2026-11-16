import express from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaignController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public / Customer can view active campaigns; Admins can view all statuses
router.get('/', optionalProtect, getCampaigns);
router.get('/:id', optionalProtect, getCampaignById);

// Admin-only campaign management
router.post('/', protect, restrictTo('admin'), createCampaign);
router.put('/:id', protect, restrictTo('admin'), updateCampaign);
router.delete('/:id', protect, restrictTo('admin'), deleteCampaign);

export default router;
