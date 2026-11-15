import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    campaignType: {
      type: String,
      required: [true, 'Campaign type is required'],
      enum: [
        'Double Points',
        'Bonus Points',
        'Festival Campaign',
        'Limited-Time Campaign',
        'New Customer Campaign'
      ],
      default: 'Double Points'
    },
    multiplier: {
      type: Number,
      default: 1,
      min: [1, 'Multiplier must be at least 1']
    },
    bonusPoints: {
      type: Number,
      default: 0,
      min: [0, 'Bonus points cannot be negative']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Paused', 'Ended'],
      default: 'Active',
      index: true
    },
    eligibleProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    allowStacking: {
      type: Boolean,
      default: false
    },
    bannerText: {
      type: String,
      default: ''
    },
    totalBonusAwarded: {
      type: Number,
      default: 0
    },
    totalRedemptionsCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

campaignSchema.index({ status: 1, startDate: 1, endDate: 1 });

export const Campaign = mongoose.model('Campaign', campaignSchema);
