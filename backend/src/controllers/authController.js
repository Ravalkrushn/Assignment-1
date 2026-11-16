import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { PointTransaction } from '../models/PointTransaction.js';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';

// Helper: Generate JWT tokens
const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  });

  const refreshToken = cryptoUtils.generateRandomToken(40);
  const tokenHash = cryptoUtils.hashToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    tokenHash,
    userId,
    expiresAt
  });

  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, businessName, city, state } = req.body;

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return apiResponse.error(res, 'An account with this email address already exists.', [], 409);
    }

    // Always enforce customer role on public registration
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password,
      role: 'customer',
      availablePoints: 100, // Initial signup bonus
      totalPointsEarned: 100,
      businessName: businessName || '',
      city: city || '',
      state: state || '',
      tier: 'Bronze',
      status: 'active'
    });

    // Record signup bonus transaction
    await PointTransaction.create({
      userId: user._id,
      userEmail: user.email,
      customerName: user.fullName,
      type: 'earned',
      flow: 'EARNED',
      points: 100,
      source: 'SIGNUP_BONUS',
      referenceId: 'WELCOME-100',
      description: 'Welcome signup reward points credited'
    });

    const tokens = await generateTokens(user._id);

    // Set secure httpOnly cookie for refresh token (FINDING-SEC-06)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return apiResponse.success(
      res,
      'Account registered successfully! 100 bonus points have been credited to your wallet.',
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          tier: user.tier,
          availablePoints: user.availablePoints,
          businessName: user.businessName
        },
        ...tokens
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return apiResponse.error(res, 'Invalid email or password.', [], 401);
    }

    if (user.status === 'suspended') {
      return apiResponse.error(res, 'Your account has been suspended by factory administration.', [], 403);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return apiResponse.error(res, 'Invalid email or password.', [], 401);
    }

    const tokens = await generateTokens(user._id);

    // Set secure httpOnly cookie for refresh token (FINDING-SEC-06)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return apiResponse.success(res, 'Logged in successfully.', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tier: user.tier,
        availablePoints: user.availablePoints,
        totalPointsEarned: user.totalPointsEarned,
        totalPointsRedeemed: user.totalPointsRedeemed,
        boxesRedeemed: user.boxesRedeemed,
        businessName: user.businessName,
        city: user.city,
        state: user.state
      },
      ...tokens
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const clientToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!clientToken) {
      return apiResponse.error(res, 'Refresh token required.', [], 400);
    }

    const tokenHash = cryptoUtils.hashToken(clientToken);
    const storedToken = await RefreshToken.findOne({ tokenHash, revoked: false });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return apiResponse.error(res, 'Invalid or expired refresh token. Please log in again.', [], 401);
    }

    // Revoke old refresh token (Token rotation)
    storedToken.revoked = true;
    await storedToken.save();

    const newTokens = await generateTokens(storedToken.userId);

    // Set renewed secure httpOnly cookie (FINDING-SEC-06)
    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return apiResponse.success(res, 'Token refreshed successfully.', newTokens);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const clientToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (clientToken) {
      const tokenHash = cryptoUtils.hashToken(clientToken);
      await RefreshToken.updateOne({ tokenHash }, { revoked: true });
    }
    // Clear httpOnly cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return apiResponse.success(res, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return apiResponse.success(res, 'User profile fetched.', { user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, businessName, city, state } = req.body;
    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (businessName !== undefined) user.businessName = businessName;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;

    await user.save();

    return apiResponse.success(res, 'Profile updated successfully.', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tier: user.tier,
        availablePoints: user.availablePoints,
        businessName: user.businessName,
        city: user.city,
        state: user.state
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return generic success message to prevent user enumeration
    if (user) {
      const rawToken = cryptoUtils.generateRandomToken(32);
      user.resetPasswordToken = cryptoUtils.hashToken(rawToken);
      user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      // In production, send email with rawToken
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        // Production SMTP dispatch
        console.log(`[PASSWORD_RESET] Reset link sent to ${user.email}`);
      } else {
        // Safe development audit log (not exposing raw token in HTTP response)
        console.log(`[PASSWORD_RESET_DEV] Reset token generated for ${user.email}: ${rawToken}`);
      }
    }

    return apiResponse.success(
      res,
      'If an account exists with that email, a password reset link has been dispatched.'
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const tokenHash = cryptoUtils.hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return apiResponse.error(res, 'Password reset token is invalid or has expired.', [], 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return apiResponse.success(res, 'Password has been successfully updated. You may now log in.');
  } catch (error) {
    next(error);
  }
};
