import { apiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, res, next) => {
  return apiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, [], 404);
};

export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled Exception on ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  const errors = env.NODE_ENV === 'development' && err.stack ? [err.stack] : [];

  return apiResponse.error(res, message, errors, statusCode);
};
