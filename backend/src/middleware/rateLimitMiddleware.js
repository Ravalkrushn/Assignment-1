import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    return apiResponse.error(res, 'Too many requests from this IP, please try again after 15 minutes.', [], 429);
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
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
