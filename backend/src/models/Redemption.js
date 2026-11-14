import mongoose from 'mongoose';

const redemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    customerName: {
      type: String
    },
    userEmail: {
      type: String
    },
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: true
    },
    rewardName: {
      type: String,
      required: true
    },
    pointsSpent: {
      type: Number,
      required: true
    },
    redemptionCode: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'dispatched', 'delivered', 'cancelled'],
      default: 'delivered'
    }
  },
  {
    timestamps: true
  }
);

redemptionSchema.index({ userId: 1, createdAt: -1 });

export const Redemption = mongoose.model('Redemption', redemptionSchema);
