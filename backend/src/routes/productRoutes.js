import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  createProductValidator,
  updateProductValidator
} from '../validators/productValidators.js';

const router = express.Router();

router.get('/', optionalProtect, getProducts);
router.get('/:id', optionalProtect, getProductById);

// Admin-only operations
router.post('/', protect, restrictTo('admin'), createProductValidator, validateRequest, createProduct);
router.put('/:id', protect, restrictTo('admin'), updateProductValidator, validateRequest, updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

export default router;
