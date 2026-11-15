import { AuditLog } from '../models/AuditLog.js';
import { logger } from './logger.js';

/**
 * Reusable utility to log administrative activities safely.
 * Strips sensitive data (passwords, tokens, secrets) before persisting.
 */
export const logAdminActivity = async ({
  admin,
  actionType,
  module,
  targetId = '',
  description,
  metadata = {},
  req = null
}) => {
  try {
    const adminId = admin?._id || admin?.id;
    const adminName = admin?.fullName || admin?.name || 'Administrator';
    const adminEmail = admin?.email || 'admin@factory.io';

    const ipAddress = req
      ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1')
      : '127.0.0.1';

    // Sanitize metadata to never persist sensitive tokens or passwords
    const cleanMeta = { ...metadata };
    delete cleanMeta.password;
    delete cleanMeta.confirmPassword;
    delete cleanMeta.accessToken;
    delete cleanMeta.refreshToken;
    delete cleanMeta.secret;

    await AuditLog.create({
      adminId,
      adminName,
      adminEmail,
      actionType,
      module,
      targetId: targetId ? targetId.toString() : '',
      description,
      metadata: cleanMeta,
      ipAddress
    });
  } catch (err) {
    logger.error(`Failed to record audit log: ${err.message}`);
  }
};
