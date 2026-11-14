import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    availablePoints: {
      type: Number,
      default: 0,
      min: [0, 'Available points cannot be negative']
    },
    totalPointsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Total points earned cannot be negative']
    },
    totalPointsRedeemed: {
      type: Number,
      default: 0,
      min: [0, 'Total points redeemed cannot be negative']
    },
    boxesRedeemed: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold VIP', 'Platinum Elite'],
      default: 'Bronze'
    },
    businessName: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
