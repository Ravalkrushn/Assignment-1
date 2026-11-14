import { body, param } from 'express-validator';

export const createRewardValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Reward name is required'),
  body('pointsRequired')
    .notEmpty()
    .withMessage('Points required is required')
    .isInt({ min: 1 })
    .withMessage('Points required must be a positive integer'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity cannot be negative'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
];

export const updateRewardValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid reward ID format'),
  body('pointsRequired')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points required must be a positive integer'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity cannot be negative'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];
