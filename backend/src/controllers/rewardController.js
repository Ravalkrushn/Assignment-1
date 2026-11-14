import { Reward } from '../models/Reward.js';
import { User } from '../models/User.js';
import { Redemption } from '../models/Redemption.js';
import { PointTransaction } from '../models/PointTransaction.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';
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
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
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

    // Check reward
    const reward = await Reward.findById(rewardId);
    if (!reward || reward.status !== 'active') {
      return apiResponse.error(res, 'This reward is currently unavailable.', [], 400);
    }

    if (reward.quantity <= 0) {
      return apiResponse.error(res, 'This reward is out of stock.', [], 400);
    }

    // Check customer points
    const user = await User.findById(req.user._id);
    if (user.availablePoints < reward.pointsRequired) {
      return apiResponse.error(
        res,
        `Insufficient points: You need ${reward.pointsRequired - user.availablePoints} more points to claim this reward.`,
        [],
        400
      );
    }

    // Atomic decrement of reward quantity
    const updatedReward = await Reward.findOneAndUpdate(
      { _id: reward._id, quantity: { $gt: 0 } },
      { $inc: { quantity: -1 } },
      { new: true }
    );

    if (!updatedReward) {
      return apiResponse.error(res, 'This reward just went out of stock.', [], 400);
    }

    // Deduct points from user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: {
          availablePoints: -reward.pointsRequired,
          totalPointsRedeemed: reward.pointsRequired
        }
      },
      { new: true }
    );

    // Generate unique claim coupon token
    const claimCode = `CLAIM-${cryptoUtils.generateRandomToken(4).toUpperCase()}`;

    // Record redemption
    const redemption = await Redemption.create({
      userId: user._id,
      customerName: user.fullName,
      userEmail: user.email,
      rewardId: reward._id,
      rewardName: reward.name,
      pointsSpent: reward.pointsRequired,
      redemptionCode: claimCode,
      status: reward.category === 'Coupons' || reward.category === 'Gift Cards' ? 'delivered' : 'dispatched'
    });

    // Record point transaction
    await PointTransaction.create({
      userId: user._id,
      userEmail: user.email,
      customerName: user.fullName,
      type: 'redeemed',
      flow: 'SPENT',
      points: reward.pointsRequired,
      source: 'REWARD_CLAIM',
      referenceId: claimCode,
      description: `Claimed catalog reward: ${reward.name}`
    });

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

    return apiResponse.success(res, 'Reward created successfully.', { reward }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateReward = async (req, res, next) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reward) {
      return apiResponse.error(res, 'Reward not found.', [], 404);
    }
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
    return apiResponse.success(res, 'Reward marked inactive.');
  } catch (error) {
    next(error);
  }
};
