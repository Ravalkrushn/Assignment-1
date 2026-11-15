import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['customer', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isInternalNote: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String,
      required: true
    },
    issueCategory: {
      type: String,
      required: true,
      enum: [
        'Invalid Product Code',
        'Already Redeemed Code',
        'Points Not Credited',
        'Reward Redemption Problem',
        'Missing Reward Delivery',
        'Incorrect Fulfillment Status',
        'Other'
      ],
      default: 'Other'
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    relatedProductCode: {
      type: String,
      default: ''
    },
    relatedRedemptionId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed'],
      default: 'Open',
      index: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    messages: [supportMessageSchema],
    resolutionDetails: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

supportTicketSchema.index({ userId: 1, createdAt: -1 });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
