import mongoose from 'mongoose';
import { Campaign } from '../models/Campaign.js';
import { Product } from '../models/Product.js';
import { logAdminActivity } from '../utils/auditLogger.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getCampaigns = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = {};

    // If not admin, only show active campaigns within current date range
    if (!req.user || req.user.role !== 'admin') {
      const now = new Date();
      query.status = 'Active';
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    } else {
      if (status && status !== 'ALL') query.status = status;
    }

    if (type && type !== 'ALL') {
      query.campaignType = type;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .populate('eligibleProducts', 'productName sku category pointsPerBox')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return apiResponse.success(res, 'Campaigns retrieved.', {
      campaigns,
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

export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('eligibleProducts', 'productName sku category pointsPerBox');

    if (!campaign) {
      return apiResponse.error(res, 'Campaign not found.', [], 404);
    }

    return apiResponse.success(res, 'Campaign details.', { campaign });
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const {
      title,
      description,
      campaignType,
      type,
      multiplier = 1,
      pointsMultiplier,
      bonusPoints = 0,
      startDate,
      endDate,
      status = 'Active',
      eligibleProducts = [],
      allowStacking = false,
      bannerText
    } = req.body;

    if (!title || !startDate || !endDate) {
      return apiResponse.error(res, 'Title, start date, and end date are required.', [], 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return apiResponse.error(res, 'Campaign end date must be after start date.', [], 400);
    }

    // Support both direct ObjectIds and SKU strings
    let resolvedEligibleProducts = [];
    if (Array.isArray(eligibleProducts) && eligibleProducts.length > 0) {
      for (const item of eligibleProducts) {
        if (mongoose.Types.ObjectId.isValid(item)) {
          resolvedEligibleProducts.push(item);
        } else if (typeof item === 'string') {
          const matchedProd = await Product.findOne({ sku: item.toUpperCase() });
          if (matchedProd) resolvedEligibleProducts.push(matchedProd._id);
        }
      }
    }

    const finalType = campaignType || type || 'Double Points';
    const finalMultiplier = Number(multiplier || pointsMultiplier) || 1;

    const campaign = await Campaign.create({
      title,
      description: description || '',
      campaignType: finalType,
      multiplier: finalMultiplier,
      bonusPoints: Number(bonusPoints) || 0,
      startDate: start,
      endDate: end,
      status,
      eligibleProducts: resolvedEligibleProducts,
      allowStacking,
      bannerText: bannerText || `${title} is now LIVE!`,
      createdBy: req.user._id
    });

    await logAdminActivity({
      admin: req.user,
      actionType: 'CREATE_CAMPAIGN',
      module: 'Campaigns',
      targetId: campaign._id,
      description: `Created new promotion campaign "${campaign.title}" (${campaign.campaignType})`,
      metadata: { campaignType: campaign.campaignType, multiplier: campaign.multiplier, bonusPoints: campaign.bonusPoints },
      req
    });

    return apiResponse.success(res, 'Campaign created successfully.', { campaign }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return apiResponse.error(res, 'Campaign not found.', [], 404);
    }

    const {
      title,
      description,
      campaignType,
      multiplier,
      bonusPoints,
      startDate,
      endDate,
      status,
      eligibleProducts,
      allowStacking,
      bannerText
    } = req.body;

    if (title) campaign.title = title;
    if (description !== undefined) campaign.description = description;
    if (campaignType) campaign.campaignType = campaignType;
    if (multiplier !== undefined) campaign.multiplier = Number(multiplier);
    if (bonusPoints !== undefined) campaign.bonusPoints = Number(bonusPoints);
    if (startDate) campaign.startDate = new Date(startDate);
    if (endDate) campaign.endDate = new Date(endDate);
    if (status) campaign.status = status;
    if (eligibleProducts) campaign.eligibleProducts = eligibleProducts;
    if (allowStacking !== undefined) campaign.allowStacking = allowStacking;
    if (bannerText !== undefined) campaign.bannerText = bannerText;

    if (campaign.startDate >= campaign.endDate) {
      return apiResponse.error(res, 'End date must be after start date.', [], 400);
    }

    await campaign.save();

    await logAdminActivity({
      admin: req.user,
      actionType: 'UPDATE_CAMPAIGN',
      module: 'Campaigns',
      targetId: campaign._id,
      description: `Updated promotion campaign "${campaign.title}"`,
      metadata: { status: campaign.status, multiplier: campaign.multiplier },
      req
    });

    return apiResponse.success(res, 'Campaign updated successfully.', { campaign });
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return apiResponse.error(res, 'Campaign not found.', [], 404);
    }

    await Campaign.findByIdAndDelete(req.params.id);

    await logAdminActivity({
      admin: req.user,
      actionType: 'DELETE_CAMPAIGN',
      module: 'Campaigns',
      targetId: campaign._id,
      description: `Deleted campaign "${campaign.title}"`,
      metadata: { title: campaign.title },
      req
    });

    return apiResponse.success(res, 'Campaign deleted successfully.');
  } catch (error) {
    next(error);
  }
};
