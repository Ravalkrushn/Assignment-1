import mongoose from 'mongoose';

const codeBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
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
    count: {
      type: Number,
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const CodeBatch = mongoose.model('CodeBatch', codeBatchSchema);
