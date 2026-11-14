import { FraudLog } from '../models/FraudLog.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getFraudLogs = async (req, res, next) => {
  try {
    const { riskLevel, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (riskLevel && riskLevel !== 'ALL') {
      query.riskLevel = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1).toLowerCase();
    }
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
        { eventType: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await FraudLog.countDocuments(query);
    const logs = await FraudLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return apiResponse.success(res, 'Fraud monitoring logs retrieved.', {
      logs,
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

export const getFraudLogById = async (req, res, next) => {
  try {
    const log = await FraudLog.findById(req.params.id);
    if (!log) {
      return apiResponse.error(res, 'Incident log not found.', [], 404);
    }
    return apiResponse.success(res, 'Incident forensic analysis retrieved.', { log });
  } catch (error) {
    next(error);
  }
};

export const updateFraudStatus = async (req, res, next) => {
  try {
    const { status, actionTaken } = req.body;
    const log = await FraudLog.findById(req.params.id);
    if (!log) {
      return apiResponse.error(res, 'Incident log not found.', [], 404);
    }

    if (status) log.status = status;
    if (actionTaken) log.actionTaken = actionTaken;
    await log.save();

    return apiResponse.success(res, 'Fraud incident status updated.', { log });
  } catch (error) {
    next(error);
  }
};

export const blockIp = async (req, res, next) => {
  try {
    const { ipAddress, reason } = req.body;
    if (!ipAddress) {
      return apiResponse.error(res, 'ipAddress is required.', [], 400);
    }

    await FraudLog.updateMany(
      { ipAddress },
      { status: 'Blacklisted', actionTaken: `IP Blacklisted by Admin: ${reason || 'Excessive malicious probes'}` }
    );

    return apiResponse.success(res, `Origin IP ${ipAddress} blacklisted from code scanning.`);
  } catch (error) {
    next(error);
  }
};

export const unblockIp = async (req, res, next) => {
  try {
    const { ipAddress } = req.body;
    if (!ipAddress) {
      return apiResponse.error(res, 'ipAddress is required.', [], 400);
    }

    await FraudLog.updateMany(
      { ipAddress, status: 'Blacklisted' },
      { status: 'Resolved', actionTaken: 'Blacklist removed by Admin' }
    );

    return apiResponse.success(res, `Origin IP ${ipAddress} unblocked.`);
  } catch (error) {
    next(error);
  }
};
