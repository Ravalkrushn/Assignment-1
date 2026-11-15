import { Setting } from '../models/Setting.js';
import { logAdminActivity } from '../utils/auditLogger.js';
import { apiResponse } from '../utils/apiResponse.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ key: 'global_config' });
    if (!settings) {
      settings = await Setting.create({ key: 'global_config' });
    }
    return apiResponse.success(res, 'System settings retrieved.', { settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ key: 'global_config' });
    if (!settings) {
      settings = new Setting({ key: 'global_config' });
    }

    const {
      plantName,
      plantCode,
      contactPhone,
      pointsExpiryMonths,
      defaultPointsPerBox,
      signupBonusPoints,
      maxScansPerMinute,
      maximumAttempts,
      codeRedemptionEnabled,
      minimumRedemptionPoints,
      autoApproveRewardUnder
    } = req.body;

    if (plantName) settings.plantName = plantName;
    if (plantCode) settings.plantCode = plantCode;
    if (contactPhone) settings.contactPhone = contactPhone;
    if (pointsExpiryMonths !== undefined) settings.pointsExpiryMonths = pointsExpiryMonths;
    if (defaultPointsPerBox !== undefined) settings.defaultPointsPerBox = defaultPointsPerBox;
    if (signupBonusPoints !== undefined) settings.signupBonusPoints = signupBonusPoints;
    if (maxScansPerMinute !== undefined) settings.maxScansPerMinute = maxScansPerMinute;
    if (maximumAttempts !== undefined) settings.maximumAttempts = maximumAttempts;
    if (codeRedemptionEnabled !== undefined) settings.codeRedemptionEnabled = codeRedemptionEnabled;
    if (minimumRedemptionPoints !== undefined) settings.minimumRedemptionPoints = minimumRedemptionPoints;
    if (autoApproveRewardUnder !== undefined) settings.autoApproveRewardUnder = autoApproveRewardUnder;

    await settings.save();

    await logAdminActivity({
      admin: req.user,
      actionType: 'SETTINGS_UPDATE',
      module: 'Settings',
      targetId: settings._id,
      description: 'Updated factory system configuration parameters',
      metadata: { plantName: settings.plantName, plantCode: settings.plantCode },
      req
    });

    return apiResponse.success(res, 'System configuration updated successfully.', { settings });
  } catch (error) {
    next(error);
  }
};
