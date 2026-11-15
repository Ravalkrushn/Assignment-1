import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin-only access to audit trail
router.use(protect, restrictTo('admin'));

router.get('/', getAuditLogs);

export default router;
