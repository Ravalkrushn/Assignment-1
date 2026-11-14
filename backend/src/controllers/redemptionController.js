import { Redemption } from '../models/Redemption.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getMyRedemptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Redemption.countDocuments(query);
    const redemptions = await Redemption.find(query)
      .populate('rewardId', 'name category image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return apiResponse.success(res, 'My claimed rewards retrieved.', {
      redemptions,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
        limit: parseInt(limit, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRedemptionById = async (req, res, next) => {
  try {
    const redemption = await Redemption.findById(req.params.id).populate('rewardId');
    if (!redemption) {
      return apiResponse.error(res, 'Redemption record not found.', [], 404);
    }

    // Customer can only view their own redemption
    if (req.user.role !== 'admin' && redemption.userId.toString() !== req.user._id.toString()) {
      return apiResponse.error(res, 'Access denied.', [], 403);
    }

    return apiResponse.success(res, 'Redemption record details.', { redemption });
  } catch (error) {
    next(error);
  }
};

export const getAdminRedemptions = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { rewardName: { $regex: search, $options: 'i' } },
        { redemptionCode: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Redemption.countDocuments(query);
    const redemptions = await Redemption.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return apiResponse.success(res, 'Master redemptions audit log retrieved.', {
      redemptions,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
        limit: parseInt(limit, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};
