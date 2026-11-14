import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimitMiddleware.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import pointsRoutes from './routes/pointsRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import redemptionRoutes from './routes/redemptionRoutes.js';
import fraudRoutes from './routes/fraudRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { getCustomersDirectory, getCustomerDetails, getCustomerHistory } from './controllers/analyticsController.js';
import { protect } from './middleware/authMiddleware.js';
import { restrictTo } from './middleware/roleMiddleware.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Request rate limiter
app.use('/api', globalLimiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/codes', codeRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/redemptions', redemptionRoutes);

// Admin dedicated sub-routes
app.use('/api/admin/fraud', fraudRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/settings', settingsRoutes);

// Admin Customer CRM direct endpoints
app.get('/api/admin/customers', protect, restrictTo('admin'), getCustomersDirectory);
app.get('/api/admin/customers/:id', protect, restrictTo('admin'), getCustomerDetails);
app.get('/api/admin/customers/:id/history', protect, restrictTo('admin'), getCustomerHistory);

// Catch-all 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
