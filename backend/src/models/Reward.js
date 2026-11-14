import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Reward name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    pointsRequired: {
      type: Number,
      required: [true, 'Points required is required'],
      min: [1, 'Points must be at least 1']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Coupons', 'Physical Products', 'Safety Gear', 'Merchandise', 'Exclusive Gifts', 'Gift Cards', 'Services'],
      default: 'Coupons'
    },
    image: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

export const Reward = mongoose.model('Reward', rewardSchema);
