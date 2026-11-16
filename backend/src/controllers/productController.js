import { Product } from '../models/Product.js';
import { logAdminActivity } from '../utils/auditLogger.js';
import { escapeRegex } from '../utils/securityUtils.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;

    const query = {};

    // If user is not admin, only show active products
    if (!req.user || req.user.role !== 'admin') {
      query.status = 'active';
    } else if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { productName: { $regex: safeSearch, $options: 'i' } },
        { sku: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return apiResponse.success(res, 'Products retrieved successfully.', {
      products,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
        limit: parseInt(limit, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return apiResponse.error(res, 'Product not found.', [], 404);
    }
    return apiResponse.success(res, 'Product details fetched.', { product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { productName, sku, category, description, pointsPerBox, price, status } = req.body;

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return apiResponse.error(res, `A product with SKU "${sku.toUpperCase()}" already exists.`, [], 409);
    }

    const product = await Product.create({
      productName,
      sku: sku.toUpperCase(),
      category,
      description: description || '',
      pointsPerBox,
      price: price || 0,
      status: status || 'active'
    });

    await logAdminActivity({
      admin: req.user,
      actionType: 'CREATE_PRODUCT',
      module: 'Products',
      targetId: product._id,
      description: `Created new product "${product.productName}" (SKU: ${product.sku}, ${product.pointsPerBox} pts)`,
      metadata: { sku: product.sku, pointsPerBox: product.pointsPerBox },
      req
    });

    return apiResponse.success(res, 'Product created successfully.', { product }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return apiResponse.error(res, 'Product not found.', [], 404);
    }

    // SKU cannot be changed once created to protect audit trail
    const { productName, category, description, pointsPerBox, price, status } = req.body;

    if (productName) product.productName = productName;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (pointsPerBox) product.pointsPerBox = pointsPerBox;
    if (price !== undefined) product.price = price;
    if (status) product.status = status;

    await product.save();

    await logAdminActivity({
      admin: req.user,
      actionType: 'UPDATE_PRODUCT',
      module: 'Products',
      targetId: product._id,
      description: `Updated product "${product.productName}" (SKU: ${product.sku})`,
      metadata: { sku: product.sku, pointsPerBox: product.pointsPerBox, status: product.status },
      req
    });

    return apiResponse.success(res, 'Product updated successfully.', { product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return apiResponse.error(res, 'Product not found.', [], 404);
    }

    // Soft delete/deactivate to preserve historical integrity of codes
    product.status = 'inactive';
    await product.save();

    await logAdminActivity({
      admin: req.user,
      actionType: 'DELETE_PRODUCT',
      module: 'Products',
      targetId: product._id,
      description: `Deactivated product "${product.productName}" (SKU: ${product.sku})`,
      metadata: { sku: product.sku },
      req
    });

    return apiResponse.success(res, 'Product deactivated successfully.');
  } catch (error) {
    next(error);
  }
};
