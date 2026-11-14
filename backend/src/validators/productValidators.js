import { body, param } from 'express-validator';

export const createProductValidator = [
  body('productName')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('Product SKU is required')
    .isUppercase()
    .withMessage('SKU must be uppercase'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('pointsPerBox')
    .notEmpty()
    .withMessage('Points per box is required')
    .isInt({ min: 1 })
    .withMessage('Points per box must be a positive integer'),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a valid number')
];

export const updateProductValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('productName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty'),
  body('pointsPerBox')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points per box must be a positive integer'),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a valid number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];
