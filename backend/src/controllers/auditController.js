import { AuditLog } from '../models/AuditLog.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const {
      search,
      module: moduleFilter,
      actionType,
      startDate,
      endDate,
      adminEmail,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (moduleFilter && moduleFilter !== 'ALL') {
      query.module = moduleFilter;
    }

    if (actionType && actionType !== 'ALL') {
      query.actionType = actionType;
    }

    if (adminEmail) {
      query.adminEmail = { $regex: adminEmail, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { adminName: { $regex: search, $options: 'i' } },
        { adminEmail: { $regex: search, $options: 'i' } },
        { actionType: { $regex: search, $options: 'i' } },
        { targetId: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return apiResponse.success(res, 'Audit trail logs retrieved.', {
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
