import mongoose from 'mongoose';

const fraudLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    customerName: {
      type: String,
      default: 'Anonymous / Guest'
    },
    email: {
      type: String,
      default: ''
    },
    productCodeReference: {
      type: String,
      default: ''
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'Brute Force Code Guessing',
        'Duplicate Redemption Attempt',
        'High Velocity Scanning',
        'Expired Code Entry Loop',
        'Suspicious IP Proxy Access',
        'Blocked Code Usage Attempt'
      ]
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 45
    },
    attemptsCount: {
      type: Number,
      default: 1
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: 'Domestic Distribution Hub'
    },
    description: {
      type: String,
      required: true
    },
    targetedProduct: {
      type: String,
      default: ''
    },
    actionTaken: {
      type: String,
      default: 'Logged by Security Heuristics Engine'
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Under Review', 'Investigating', 'Resolved', 'False Positive', 'Blacklisted'],
      default: 'Pending Review'
    },
    investigationNotes: [
      {
        note: { type: String, required: true },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        adminName: { type: String, default: 'Factory Admin' },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

fraudLogSchema.index({ riskLevel: 1, createdAt: -1 });
fraudLogSchema.index({ ipAddress: 1, createdAt: -1 });

export const FraudLog = mongoose.model('FraudLog', fraudLogSchema);
