import express from 'express';
import {
  getDashboardSummary,
  getCustomerAnalytics,
  getPointsAnalytics,
  getRedemptionAnalytics,
  getProductPerformance,
  getCustomersDirectory,
  getCustomerDetails,
  getCustomerHistory
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard', getDashboardSummary);
router.get('/customers', getCustomerAnalytics);
router.get('/points', getPointsAnalytics);
router.get('/redemptions', getRedemptionAnalytics);
router.get('/products', getProductPerformance);

// Customer CRM directory under admin
router.get('/directory', getCustomersDirectory);
router.get('/directory/:id', getCustomerDetails);
router.get('/directory/:id/history', getCustomerHistory);

export default router;
