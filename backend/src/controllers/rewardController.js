import { Reward } from '../models/Reward.js';
import { User } from '../models/User.js';
import { Redemption } from '../models/Redemption.js';
import { PointTransaction } from '../models/PointTransaction.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';
import { logAdminActivity } from '../utils/auditLogger.js';
import { escapeRegex } from '../utils/securityUtils.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getRewards = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;

    const query = {};
    if (!req.user || req.user.role !== 'admin') {
      query.status = 'active';
    } else if (status) {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const rewards = await Reward.find(query).sort({ pointsRequired: 1 });
    return apiResponse.success(res, 'Rewards catalog retrieved.', { rewards });
  } catch (error) {
    next(error);
  }
};

export const getRewardById = async (req, res, next) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      return apiResponse.error(res, 'Reward not found.', [], 404);
    }
    return apiResponse.success(res, 'Reward details fetched.', { reward });
  } catch (error) {
    next(error);
  }
};

export const claimReward = async (req, res, next) => {
  try {
    const rewardId = req.params.id;

    // Check reward status and initial availability
    const reward = await Reward.findById(rewardId);
    if (!reward || reward.status !== 'active') {
      return apiResponse.error(res, 'This reward is currently unavailable.', [], 400);
    }

    if (reward.quantity <= 0) {
      return apiResponse.error(res, 'This reward is out of stock.', [], 400);
    }

    // 1. Atomic conditional deduction of user points (prevents race condition & double spending)
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        availablePoints: { $gte: reward.pointsRequired }
      },
      {
        $inc: {
          availablePoints: -reward.pointsRequired,
          totalPointsRedeemed: reward.pointsRequired
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      const currentUser = await User.findById(req.user._id);
      const diff = reward.pointsRequired - (currentUser?.availablePoints || 0);
      return apiResponse.error(
        res,
        diff > 0
          ? `Insufficient points: You need ${diff} more points to claim this reward.`
          : 'Concurrent redemption conflict. Please retry.',
        [],
        400
      );
    }

    // 2. Atomic decrement of reward quantity
    const updatedReward = await Reward.findOneAndUpdate(
      { _id: reward._id, quantity: { $gt: 0 }, status: 'active' },
      { $inc: { quantity: -1 } },
      { new: true }
    );

    if (!updatedReward) {
      // Rollback deducted points if stock exhausted concurrently
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          availablePoints: reward.pointsRequired,
          totalPointsRedeemed: -reward.pointsRequired
        }
      });
      return apiResponse.error(res, 'This reward just went out of stock.', [], 400);
    }

    // Generate unique claim coupon token
    const claimCode = `CLAIM-${cryptoUtils.generateRandomToken(4).toUpperCase()}`;

    const isDigital = reward.category === 'Coupons' || reward.category === 'Gift Cards';
    const initialStatus = isDigital ? 'Delivered' : 'Pending';
    const now = new Date();
    const expectedDelivery = isDigital ? now : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const deliveryAddress = req.body?.deliveryAddress || `${updatedUser.businessName || updatedUser.fullName}, ${updatedUser.city || 'Workshop Unit'}, ${updatedUser.state || 'India'}`;

    let redemption;
    try {
      // Record redemption with fulfillment metadata
      redemption = await Redemption.create({
        userId: updatedUser._id,
        customerName: updatedUser.fullName,
        userEmail: updatedUser.email,
        rewardId: reward._id,
        rewardName: reward.name,
        pointsSpent: reward.pointsRequired,
        redemptionCode: claimCode,
        status: initialStatus,
        deliveryAddress,
        expectedDeliveryDate: expectedDelivery,
        trackingNumber: isDigital ? `VOUCH-${claimCode.slice(-4)}` : '',
        timeline: [
          {
            status: initialStatus,
            timestamp: now,
            note: isDigital ? 'Digital claim voucher issued instantly.' : 'Redemption order placed, pending factory dispatch approval.',
            updatedBy: 'System'
          }
        ]
      });

      // Record point transaction
      await PointTransaction.create({
        userId: updatedUser._id,
        userEmail: updatedUser.email,
        customerName: updatedUser.fullName,
        type: 'redeemed',
        flow: 'SPENT',
        points: reward.pointsRequired,
        source: 'REWARD_CLAIM',
        referenceId: claimCode,
        description: `Claimed catalog reward: ${reward.name}`
      });
    } catch (persistErr) {
      // Rollback both points and reward stock on persistence failure
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          availablePoints: reward.pointsRequired,
          totalPointsRedeemed: -reward.pointsRequired
        }
      });
      await Reward.findByIdAndUpdate(reward._id, {
        $inc: { quantity: 1 }
      });
      throw persistErr;
    }

    return apiResponse.success(
      res,
      `Congratulations! You claimed "${reward.name}".`,
      {
        redemption,
        availablePoints: updatedUser.availablePoints,
        reward: updatedReward
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const createReward = async (req, res, next) => {
  try {
    const { name, description, pointsRequired, quantity, category, image, tag, status } = req.body;

    const reward = await Reward.create({
      name,
      description: description || '',
      pointsRequired,
      quantity,
      category,
      image: image || '',
      tag: tag || '',
      status: status || 'active'
    });

    await logAdminActivity({
      admin: req.user,
      actionType: 'CREATE_REWARD',
      module: 'Rewards',
      targetId: reward._id,
      description: `Created new catalog reward "${reward.name}" (${reward.pointsRequired} pts)`,
      metadata: { pointsRequired: reward.pointsRequired, quantity: reward.quantity },
      req
    });

    return apiResponse.success(res, 'Reward created successfully.', { reward }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateReward = async (req, res, next) => {
  try {
    const { name, description, pointsRequired, quantity, category, image, tag, status } = req.body;

    // Strict field whitelisting to eliminate mass assignment risks
    const allowedUpdates = {};
    if (name !== undefined) allowedUpdates.name = typeof name === 'string' ? name.trim() : name;
    if (description !== undefined) allowedUpdates.description = description;
    if (pointsRequired !== undefined) allowedUpdates.pointsRequired = Number(pointsRequired);
    if (quantity !== undefined) allowedUpdates.quantity = Number(quantity);
    if (category !== undefined) allowedUpdates.category = category;
    if (image !== undefined) allowedUpdates.image = image;
    if (tag !== undefined) allowedUpdates.tag = tag;
    if (status !== undefined) allowedUpdates.status = status;

    const reward = await Reward.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true });
    if (!reward) {
      return apiResponse.error(res, 'Reward not found.', [], 404);
    }

    await logAdminActivity({
      admin: req.user,
      actionType: 'UPDATE_REWARD',
      module: 'Rewards',
      targetId: reward._id,
      description: `Updated reward "${reward.name}"`,
      metadata: { pointsRequired: reward.pointsRequired, quantity: reward.quantity, status: reward.status },
      req
    });

    return apiResponse.success(res, 'Reward updated successfully.', { reward });
  } catch (error) {
    next(error);
  }
};

export const deleteReward = async (req, res, next) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
    if (!reward) {
      return apiResponse.error(res, 'Reward not found.', [], 404);
    }

    await logAdminActivity({
      admin: req.user,
      actionType: 'DELETE_REWARD',
      module: 'Rewards',
      targetId: reward._id,
      description: `Deactivated reward "${reward.name}"`,
      metadata: {},
      req
    });

    return apiResponse.success(res, 'Reward marked inactive.');
  } catch (error) {
    next(error);
  }
};
