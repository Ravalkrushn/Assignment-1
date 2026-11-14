import { body, param } from 'express-validator';

export const generateCodesValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('count')
    .notEmpty()
    .withMessage('Number of codes is required')
    .isInt({ min: 1, max: 500 })
    .withMessage('Count must be an integer between 1 and 500'),
  body('customPoints')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Custom points must be a positive integer'),
  body('expiryMonths')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Expiry months must be between 1 and 60')
];

export const redeemCodeValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Product code is required')
    .isLength({ min: 5, max: 30 })
    .withMessage('Product code length is invalid')
];
