import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    pointsPerBox: {
      type: Number,
      required: [true, 'Points per box is required'],
      min: [1, 'Points must be at least 1']
    },
    price: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    totalCodesGenerated: {
      type: Number,
      default: 0
    },
    totalRedeemed: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const Product = mongoose.model('Product', productSchema);
