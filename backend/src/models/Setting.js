import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global_config'
    },
    plantName: {
      type: String,
      default: 'Apex Precision Bearings & Hydraulics Ltd.'
    },
    plantCode: {
      type: String,
      default: 'PLANT-PUNE-04'
    },
    contactPhone: {
      type: String,
      default: '+91 20 6712 3456'
    },
    pointsExpiryMonths: {
      type: Number,
      default: 12
    },
    defaultPointsPerBox: {
      type: Number,
      default: 100
    },
    signupBonusPoints: {
      type: Number,
      default: 100
    },
    maximumAttempts: {
      type: Number,
      default: 5
    },
    maxScansPerMinute: {
      type: Number,
      default: 5
    },
    codeRedemptionEnabled: {
      type: Boolean,
      default: true
    },
    minimumRedemptionPoints: {
      type: Number,
      default: 50
    },
    autoApproveRewardUnder: {
      type: Number,
      default: 500
    }
  },
  {
    timestamps: true
  }
);

export const Setting = mongoose.model('Setting', settingSchema);
