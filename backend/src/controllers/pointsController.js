import { User } from '../models/User.js';
import { PointTransaction } from '../models/PointTransaction.js';
import { logAdminActivity } from '../utils/auditLogger.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      'availablePoints totalPointsEarned totalPointsRedeemed boxesRedeemed tier'
    );
    return apiResponse.success(res, 'Points balance retrieved.', { balance: user });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const { flow, page = 1, limit = 20 } = req.query;

    const query = { userId: req.user._id };
    if (flow && ['EARNED', 'SPENT'].includes(flow.toUpperCase())) {
      query.flow = flow.toUpperCase();
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await PointTransaction.countDocuments(query);
    const transactions = await PointTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return apiResponse.success(res, 'Transaction history retrieved.', {
      transactions,
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

export const getPointsSummary = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const summary = await PointTransaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            flow: '$flow'
          },
          totalPoints: { $sum: '$points' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return apiResponse.success(res, 'Points summary chart data retrieved.', { summary });
  } catch (error) {
    next(error);
  }
};

export const getAdminPointsOverview = async (req, res, next) => {
  try {
    const totals = await User.aggregate([
      {
        $group: {
          _id: null,
          totalAvailable: { $sum: '$availablePoints' },
          totalEarned: { $sum: '$totalPointsEarned' },
          totalRedeemed: { $sum: '$totalPointsRedeemed' }
        }
      }
    ]);

    const result = totals[0] || { totalAvailable: 0, totalEarned: 0, totalRedeemed: 0 };
    return apiResponse.success(res, 'Points overview fetched.', { overview: result });
  } catch (error) {
    next(error);
  }
};

export const adjustPoints = async (req, res, next) => {
  try {
    const { userId, points, reason } = req.body;

    if (!userId || points === undefined || !reason) {
      return apiResponse.error(res, 'userId, points adjustment amount, and reason are required.', [], 400);
    }

    const numPoints = parseInt(points, 10);
    const user = await User.findById(userId);
    if (!user) {
      return apiResponse.error(res, 'Customer not found.', [], 404);
    }

    if (numPoints < 0 && user.availablePoints < Math.abs(numPoints)) {
      return apiResponse.error(res, 'Cannot deduct points: insufficient user balance.', [], 400);
    }

    user.availablePoints += numPoints;
    if (numPoints > 0) {
      user.totalPointsEarned += numPoints;
    } else {
      user.totalPointsRedeemed += Math.abs(numPoints);
    }
    await user.save();

    // Audit transaction
    await PointTransaction.create({
      userId: user._id,
      userEmail: user.email,
      customerName: user.fullName,
      type: 'adjusted',
      flow: numPoints >= 0 ? 'EARNED' : 'SPENT',
      points: Math.abs(numPoints),
      source: 'ADMIN_ADJUSTMENT',
      referenceId: `ADMIN-${Date.now()}`,
      description: `Admin manual adjustment: ${reason}`
    });

    await logAdminActivity({
      admin: req.user,
      actionType: 'POINTS_ADJUSTED',
      module: 'Customers',
      targetId: user._id,
      description: `Adjusted points by ${numPoints >= 0 ? '+' : ''}${numPoints} for ${user.fullName} (${user.email}). Reason: ${reason}`,
      metadata: { targetUser: user.email, pointsDelta: numPoints, reason },
      req
    });

    return apiResponse.success(res, `Points adjusted by ${numPoints} for ${user.fullName}.`, {
      availablePoints: user.availablePoints
    });
  } catch (error) {
    next(error);
  }
};
