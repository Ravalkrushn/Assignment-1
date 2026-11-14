import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index automatically cleans up expired tokens
    },
    revoked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
