import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { ProductCode } from '../models/ProductCode.js';
import { Reward } from '../models/Reward.js';
import { PointTransaction } from '../models/PointTransaction.js';
import { Redemption } from '../models/Redemption.js';
import { FraudLog } from '../models/FraudLog.js';
import { escapeRegex } from '../utils/securityUtils.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      totalCodesGenerated,
      totalCodesRedeemed,
      unusedCodes,
      pointTotals,
      totalRewardsClaimed,
      pendingFraudAlerts
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', status: 'active' }),
      Product.countDocuments(),
      ProductCode.countDocuments(),
      ProductCode.countDocuments({ status: 'redeemed' }),
      ProductCode.countDocuments({ status: 'unused' }),
      PointTransaction.aggregate([
        {
          $group: {
            _id: '$flow',
            total: { $sum: '$points' }
          }
        }
      ]),
      Redemption.countDocuments(),
      FraudLog.countDocuments({ status: 'Pending Review' })
    ]);

    let totalPointsDistributed = 0;
    let totalPointsRedeemed = 0;
    pointTotals.forEach(p => {
      if (p._id === 'EARNED') totalPointsDistributed = p.total;
      if (p._id === 'SPENT') totalPointsRedeemed = p.total;
    });

    return apiResponse.success(res, 'Admin dashboard summary retrieved.', {
      stats: {
        totalCustomers,
        activeCustomers,
        totalProducts,
        totalCodesGenerated,
        totalCodesRedeemed,
        unusedCodes,
        totalPointsDistributed,
        totalPointsRedeemed,
        totalRewardsClaimed,
        pendingFraudAlerts,
        redemptionRate: totalCodesGenerated > 0 
          ? ((totalCodesRedeemed / totalCodesGenerated) * 100).toFixed(1) + '%'
          : '0%'
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerAnalytics = async (req, res, next) => {
  try {
    const monthlySignups = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return apiResponse.success(res, 'Customer growth analytics retrieved.', { monthlySignups });
  } catch (error) {
    next(error);
  }
};

export const getPointsAnalytics = async (req, res, next) => {
  try {
    const monthlyPoints = await PointTransaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            flow: '$flow'
          },
          points: { $sum: '$points' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return apiResponse.success(res, 'Monthly points distribution analytics retrieved.', { monthlyPoints });
  } catch (error) {
    next(error);
  }
};

export const getRedemptionAnalytics = async (req, res, next) => {
  try {
    const popularRewards = await Redemption.aggregate([
      {
        $group: {
          _id: '$rewardName',
          redemptionsCount: { $sum: 1 },
          pointsSpent: { $sum: '$pointsSpent' }
        }
      },
      { $sort: { redemptionsCount: -1 } },
      { $limit: 10 }
    ]);

    return apiResponse.success(res, 'Reward redemptions trend analytics retrieved.', { popularRewards });
  } catch (error) {
    next(error);
  }
};

export const getProductPerformance = async (req, res, next) => {
  try {
    const productStats = await Product.find()
      .select('productName sku category pointsPerBox totalCodesGenerated totalRedeemed')
      .sort({ totalRedeemed: -1 });

    const formatted = productStats.map(p => ({
      id: p._id,
      name: p.productName,
      sku: p.sku,
      category: p.category,
      pointsPerBox: p.pointsPerBox,
      generated: p.totalCodesGenerated,
      redeemed: p.totalRedeemed,
      yieldRate: p.totalCodesGenerated > 0 
        ? ((p.totalRedeemed / p.totalCodesGenerated) * 100).toFixed(1) + '%' 
        : '0%'
    }));

    return apiResponse.success(res, 'Product SKU yield rates retrieved.', { products: formatted });
  } catch (error) {
    next(error);
  }
};

export const getCustomersDirectory = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = { role: 'customer' };
    if (status && status !== 'ALL') {
      query.status = status.toLowerCase();
    }
    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { fullName: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { businessName: { $regex: safeSearch, $options: 'i' } },
        { city: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return apiResponse.success(res, 'Customer directory retrieved.', {
      customers,
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

export const getCustomerDetails = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return apiResponse.error(res, 'Customer not found.', [], 404);
    }
    return apiResponse.success(res, 'Customer details retrieved.', { customer });
  } catch (error) {
    next(error);
  }
};

export const getCustomerHistory = async (req, res, next) => {
  try {
    const transactions = await PointTransaction.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);
    return apiResponse.success(res, 'Customer transaction history.', { transactions });
  } catch (error) {
    next(error);
  }
};
