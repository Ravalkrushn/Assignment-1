import { FraudLog } from '../models/FraudLog.js';
import { User } from '../models/User.js';
import { logAdminActivity } from '../utils/auditLogger.js';
import { escapeRegex } from '../utils/securityUtils.js';
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
      const safeSearch = escapeRegex(search);
      query.$or = [
        { customerName: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { ipAddress: { $regex: safeSearch, $options: 'i' } },
        { eventType: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
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
    const { status, actionTaken, note } = req.body;
    const log = await FraudLog.findById(req.params.id);
    if (!log) {
      return apiResponse.error(res, 'Incident log not found.', [], 404);
    }

    const previousStatus = log.status;
    if (status) log.status = status;
    if (actionTaken) log.actionTaken = actionTaken;

    if (note) {
      log.investigationNotes.push({
        note: note.trim(),
        adminId: req.user._id,
        adminName: req.user.fullName || 'Admin',
        createdAt: new Date()
      });
    }

    await log.save();

    await logAdminActivity({
      admin: req.user,
      actionType: 'FRAUD_STATUS_UPDATE',
      module: 'Fraud',
      targetId: log._id,
      description: `Updated fraud incident ${log._id} status from "${previousStatus}" to "${log.status}"`,
      metadata: { eventType: log.eventType, ipAddress: log.ipAddress, status: log.status },
      req
    });

    return apiResponse.success(res, 'Fraud incident status updated.', { log });
  } catch (error) {
    next(error);
  }
};

export const addInvestigationNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return apiResponse.error(res, 'Investigation note cannot be empty.', [], 400);
    }

    const log = await FraudLog.findById(req.params.id);
    if (!log) {
      return apiResponse.error(res, 'Incident log not found.', [], 404);
    }

    log.investigationNotes.push({
      note: note.trim(),
      adminId: req.user._id,
      adminName: req.user.fullName || 'Factory Owner Admin',
      createdAt: new Date()
    });

    if (log.status === 'Pending Review') {
      log.status = 'Under Review';
    }

    await log.save();

    await logAdminActivity({
      admin: req.user,
      actionType: 'FRAUD_NOTE_ADDED',
      module: 'Fraud',
      targetId: log._id,
      description: `Added investigation note to fraud incident ${log._id}`,
      metadata: { note: note.trim() },
      req
    });

    return apiResponse.success(res, 'Investigation note recorded.', { log, fraudLog: log });
  } catch (error) {
    next(error);
  }
};

export const blockCustomer = async (req, res, next) => {
  try {
    const { userId, reason } = req.body;
    if (!userId) {
      return apiResponse.error(res, 'userId is required.', [], 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return apiResponse.error(res, 'Customer not found.', [], 404);
    }

    user.status = 'suspended';
    await user.save();

    await logAdminActivity({
      admin: req.user,
      actionType: 'BLOCK_CUSTOMER',
      module: 'Customers',
      targetId: user._id,
      description: `Blocked customer "${user.fullName}" (${user.email}). Reason: ${reason || 'Suspicious fraud activity'}`,
      metadata: { customerEmail: user.email, reason },
      req
    });

    return apiResponse.success(res, `Customer account "${user.fullName}" has been blocked.`);
  } catch (error) {
    next(error);
  }
};

export const unblockCustomer = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return apiResponse.error(res, 'userId is required.', [], 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      return apiResponse.error(res, 'Customer not found.', [], 404);
    }

    user.status = 'active';
    await user.save();

    await logAdminActivity({
      admin: req.user,
      actionType: 'UNBLOCK_CUSTOMER',
      module: 'Customers',
      targetId: user._id,
      description: `Unblocked customer "${user.fullName}" (${user.email}).`,
      metadata: { customerEmail: user.email },
      req
    });

    return apiResponse.success(res, `Customer account "${user.fullName}" has been restored.`);
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

    await logAdminActivity({
      admin: req.user,
      actionType: 'BLOCK_IP',
      module: 'Fraud',
      targetId: ipAddress,
      description: `Blacklisted origin IP ${ipAddress}. Reason: ${reason || 'Excessive malicious probes'}`,
      metadata: { ipAddress, reason },
      req
    });

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

    await logAdminActivity({
      admin: req.user,
      actionType: 'UNBLOCK_IP',
      module: 'Fraud',
      targetId: ipAddress,
      description: `Removed blacklist for origin IP ${ipAddress}.`,
      metadata: { ipAddress },
      req
    });

    return apiResponse.success(res, `Origin IP ${ipAddress} unblocked.`);
  } catch (error) {
    next(error);
  }
};
