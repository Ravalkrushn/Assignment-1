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
      enum: [
        'Pending', 'Approved', 'Processing', 'Shipped', 'Delivered', 'Rejected',
        'pending', 'approved', 'processing', 'dispatched', 'shipped', 'delivered', 'cancelled', 'rejected'
      ],
      default: 'Pending'
    },
    trackingNumber: {
      type: String,
      default: ''
    },
    carrier: {
      type: String,
      default: 'Factory Direct Logistics'
    },
    expectedDeliveryDate: {
      type: Date,
      default: null
    },
    deliveryAddress: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    adminNotes: {
      type: String,
      default: ''
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        updatedBy: { type: String, default: 'System' }
      }
    ]
  },
  {
    timestamps: true
  }
);

redemptionSchema.index({ userId: 1, createdAt: -1 });

export const Redemption = mongoose.model('Redemption', redemptionSchema);
