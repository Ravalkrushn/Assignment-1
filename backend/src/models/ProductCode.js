import mongoose from 'mongoose';

const productCodeSchema = new mongoose.Schema(
  {
    codeHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    codePrefix: {
      type: String,
      default: 'BOX',
      uppercase: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    batchId: {
      type: String,
      required: true,
      index: true
    },
    points: {
      type: Number,
      required: true,
      min: [1, 'Points must be at least 1']
    },
    status: {
      type: String,
      enum: ['unused', 'redeemed', 'expired', 'blocked'],
      default: 'unused',
      index: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    redeemedByUserEmail: {
      type: String,
      default: null
    },
    redeemedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimal verification and status queries
productCodeSchema.index({ codeHash: 1, status: 1 });
productCodeSchema.index({ batchId: 1, status: 1 });

export const ProductCode = mongoose.model('ProductCode', productCodeSchema);
