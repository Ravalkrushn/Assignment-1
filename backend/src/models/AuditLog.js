import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    adminName: {
      type: String,
      required: true
    },
    adminEmail: {
      type: String,
      required: true,
      index: true
    },
    actionType: {
      type: String,
      required: true,
      index: true
    },
    module: {
      type: String,
      required: true,
      enum: ['Products', 'Rewards', 'Fulfillment', 'Codes', 'Customers', 'Fraud', 'Settings', 'Support', 'Campaigns', 'System'],
      index: true
    },
    targetId: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ actionType: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
