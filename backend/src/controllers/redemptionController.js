import { Redemption } from '../models/Redemption.js';
import { User } from '../models/User.js';
import { PointTransaction } from '../models/PointTransaction.js';
import { logAdminActivity } from '../utils/auditLogger.js';
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

export const updateFulfillmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status: targetStatus,
      trackingNumber,
      carrier,
      expectedDeliveryDate,
      rejectionReason,
      adminNotes,
      note
    } = req.body;

    const redemption = await Redemption.findById(id);
    if (!redemption) {
      return apiResponse.error(res, 'Redemption record not found.', [], 404);
    }

    // Canonicalize current and target status
    const formatStatus = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : 'Pending');
    const currentStatus = formatStatus(redemption.status);
    const nextStatus = formatStatus(targetStatus);

    const validStatuses = ['Pending', 'Approved', 'Processing', 'Shipped', 'Delivered', 'Rejected'];
    if (!validStatuses.includes(nextStatus)) {
      return apiResponse.error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, [], 400);
    }

    // Allowed status transitions mapping
    const allowedTransitions = {
      Pending: ['Approved', 'Rejected'],
      Approved: ['Processing', 'Rejected'],
      Processing: ['Shipped', 'Rejected'],
      Shipped: ['Delivered'],
      Delivered: [],
      Rejected: []
    };

    if (currentStatus === nextStatus) {
      // Just updating tracking or notes without status change is allowed
    } else {
      const allowedNext = allowedTransitions[currentStatus] || [];
      if (!allowedNext.includes(nextStatus)) {
        return apiResponse.error(
          res,
          `Invalid fulfillment status transition from "${currentStatus}" to "${nextStatus}". Allowed next: [${allowedNext.join(', ')}]`,
          [],
          400
        );
      }
    }

    // If rejecting, require rejection reason and refund points atomically
    if (nextStatus === 'Rejected' && currentStatus !== 'Rejected') {
      if (!rejectionReason || rejectionReason.trim().length < 3) {
        return apiResponse.error(res, 'A clear rejection reason is required when rejecting a fulfillment request.', [], 400);
      }
      redemption.rejectionReason = rejectionReason.trim();

      // Refund points to user
      await User.findByIdAndUpdate(redemption.userId, {
        $inc: {
          availablePoints: redemption.pointsSpent,
          totalPointsRedeemed: -redemption.pointsSpent
        }
      });

      // Log point transaction
      await PointTransaction.create({
        userId: redemption.userId,
        userEmail: redemption.userEmail,
        customerName: redemption.customerName,
        type: 'adjusted',
        flow: 'EARNED',
        points: redemption.pointsSpent,
        source: 'ADMIN_ADJUSTMENT',
        referenceId: redemption.redemptionCode,
        description: `Points refund for rejected reward fulfillment (${redemption.rewardName}): ${rejectionReason.trim()}`
      });
    }

    if (trackingNumber !== undefined) redemption.trackingNumber = trackingNumber.trim();
    if (carrier !== undefined) redemption.carrier = carrier.trim();
    if (expectedDeliveryDate !== undefined) redemption.expectedDeliveryDate = expectedDeliveryDate;
    if (adminNotes !== undefined) redemption.adminNotes = adminNotes.trim();

    redemption.status = nextStatus;

    // Append to timeline
    const statusNote = note || (nextStatus === 'Rejected' ? `Request rejected: ${rejectionReason}` : `Status updated to ${nextStatus}`);
    redemption.timeline.push({
      status: nextStatus,
      timestamp: new Date(),
      note: statusNote,
      updatedBy: req.user.fullName || 'Factory Owner Admin'
    });

    await redemption.save();

    // Log in Audit Trail
    await logAdminActivity({
      admin: req.user,
      actionType: 'FULFILLMENT_UPDATE',
      module: 'Fulfillment',
      targetId: redemption._id,
      description: `Updated fulfillment status of order ${redemption.redemptionCode} (${redemption.rewardName}) from ${currentStatus} to ${nextStatus}`,
      metadata: {
        orderId: redemption.redemptionCode,
        rewardName: redemption.rewardName,
        customer: redemption.customerName,
        previousStatus: currentStatus,
        newStatus: nextStatus,
        trackingNumber: redemption.trackingNumber
      },
      req
    });

    return apiResponse.success(res, `Fulfillment status successfully updated to "${nextStatus}".`, {
      redemption
    });
  } catch (error) {
    next(error);
  }
};
