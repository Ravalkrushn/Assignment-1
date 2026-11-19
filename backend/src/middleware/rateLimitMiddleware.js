import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? Math.max(env.RATE_LIMIT_MAX_REQUESTS || 100, 1000) : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip in test environment
    if (process.env.NODE_ENV === 'test') return true;
    
    // In local development, do not rate-limit localhost / loopback IPs
    if (process.env.NODE_ENV !== 'production') {
      const ip = req.ip || req.connection?.remoteAddress || '';
      if (ip.includes('127.0.0.1') || ip.includes('::1') || ip === 'localhost') {
        return true;
      }
    }

    // Always skip health check routes so polling doesn't burn quota
    const path = req.path || req.originalUrl || '';
    if (path.includes('/health')) return true;

    return false;
  },
  handler: (req, res) => {
    return apiResponse.error(res, 'Too many requests from this IP, please try again shortly.', [], 429);
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 25 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV === 'test') return true;
    if (process.env.NODE_ENV !== 'production') {
      const ip = req.ip || req.connection?.remoteAddress || '';
      if (ip.includes('127.0.0.1') || ip.includes('::1') || ip === 'localhost') {
        return true;
      }
    }
    return false;
  },
  handler: (req, res) => {
    return apiResponse.error(res, 'Too many login attempts, please try again after 15 minutes.', [], 429);
  }
});

export const codeRedeemLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.MAX_REDEMPTION_ATTEMPTS || 5,
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
