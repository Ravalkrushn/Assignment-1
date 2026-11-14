import express from 'express';
import {
  generateCodes,
  getCodes,
  getCodeBatches,
  exportBatchCSV,
  blockCode,
  redeemCode
} from '../controllers/codeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { codeRedeemLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  generateCodesValidator,
  redeemCodeValidator
} from '../validators/codeValidators.js';

const router = express.Router();

// Customer redemption endpoint
router.post('/redeem', protect, codeRedeemLimiter, redeemCodeValidator, validateRequest, redeemCode);

// Admin-only endpoints
router.post('/generate', protect, restrictTo('admin'), generateCodesValidator, validateRequest, generateCodes);
router.get('/', protect, restrictTo('admin'), getCodes);
router.get('/batches', protect, restrictTo('admin'), getCodeBatches);
router.get('/batches/:id/export', protect, restrictTo('admin'), exportBatchCSV);
router.post('/:id/block', protect, restrictTo('admin'), blockCode);

export default router;
