import express from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaignController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public / Customer can view active campaigns
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);

// Admin-only campaign management
router.post('/', protect, restrictTo('admin'), createCampaign);
router.put('/:id', protect, restrictTo('admin'), updateCampaign);
router.delete('/:id', protect, restrictTo('admin'), deleteCampaign);

export default router;
