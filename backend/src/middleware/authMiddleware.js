import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return apiResponse.error(res, 'Authentication token missing. Please log in.', [], 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return apiResponse.error(res, 'User belonging to this token no longer exists.', [], 401);
    }

    if (user.status === 'suspended') {
      return apiResponse.error(res, 'Your account has been suspended. Please contact factory support.', [], 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return apiResponse.error(res, 'Invalid or expired authentication token. Please re-authenticate.', [], 401);
  }
};

/**
 * Optional Authentication Middleware
 * If a valid Bearer token or cookie is supplied, decodes and attaches user to req.user.
 * If absent or invalid, silently allows request to proceed as guest without throwing 401.
 */
export const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.status !== 'suspended') {
      req.user = user;
    }
  } catch {
    // Treat invalid or expired token as unauthenticated guest
  }

  next();
};
