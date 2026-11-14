import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'LOYALTYBOX API is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
