import express from 'express';
import {
  createTicket,
  getMyTickets,
  getTicketById,
  replyTicket,
  getAllTickets,
  updateTicketStatus
} from '../controllers/supportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Customer endpoints
router.post('/', createTicket);
router.get('/my', getMyTickets);
router.get('/:id', getTicketById);
router.post('/:id/reply', replyTicket);

// Admin endpoints
router.get('/', restrictTo('admin'), getAllTickets);
router.patch('/:id/status', restrictTo('admin'), updateTicketStatus);

export default router;
