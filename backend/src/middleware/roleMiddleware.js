import { apiResponse } from '../utils/apiResponse.js';

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return apiResponse.error(
        res,
        'Access denied: You do not have permission to perform this administrative action.',
        [],
        403
      );
    }
    next();
  };
};
