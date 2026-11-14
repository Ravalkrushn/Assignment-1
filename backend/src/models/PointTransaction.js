import mongoose from 'mongoose';

const pointTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userEmail: {
      type: String
    },
    customerName: {
      type: String
    },
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'adjusted'],
      required: true
    },
    flow: {
      type: String,
      enum: ['EARNED', 'SPENT'],
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      enum: ['CODE_REDEMPTION', 'REWARD_CLAIM', 'EXPIRATION', 'ADMIN_ADJUSTMENT', 'SIGNUP_BONUS'],
      required: true
    },
    referenceId: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

pointTransactionSchema.index({ userId: 1, createdAt: -1 });

export const PointTransaction = mongoose.model('PointTransaction', pointTransactionSchema);
