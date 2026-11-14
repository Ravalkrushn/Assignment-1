import { validationResult } from 'express-validator';
import { apiResponse } from '../utils/apiResponse.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return apiResponse.error(res, 'Validation failed for request parameters.', errorList, 422);
  }
  next();
};
