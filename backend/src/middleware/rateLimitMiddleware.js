import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';

// Disable rate limits in development and test environments
const isDevelopment = process.env.NODE_ENV !== 'production';

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: isDevelopment ? 50000 : Math.max(env.RATE_LIMIT_MAX_REQUESTS || 100, 1000),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // In test or development environment, skip completely
    if (process.env.NODE_ENV === 'test' || isDevelopment) return true;

    // In local development or loopback calls
    const ip = req.ip || req.connection?.remoteAddress || '';
    if (ip.includes('127.0.0.1') || ip.includes('::1') || ip === 'localhost') {
      return true;
    }

    // Always skip health check routes so polling doesn't burn quota
    const path = req.path || req.originalUrl || req.url || '';
    if (path.includes('/health')) return true;

    return false;
  },
  handler: (req, res) => {
    return apiResponse.error(res, 'Too many requests from this IP, please try again shortly.', [], 429);
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 5000 : 25,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV === 'test' || isDevelopment) return true;
    const ip = req.ip || req.connection?.remoteAddress || '';
    if (ip.includes('127.0.0.1') || ip.includes('::1') || ip === 'localhost') {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    return apiResponse.error(res, 'Too many login attempts, please try again after 15 minutes.', [], 429);
  }
});

export const codeRedeemLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 100 : (env.MAX_REDEMPTION_ATTEMPTS || 5),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    return apiResponse.error(
      res,
      'Rate limit exceeded: You have submitted too many code verification attempts. Please wait 1 minute.',
      [],
      429
    );
  }
});
