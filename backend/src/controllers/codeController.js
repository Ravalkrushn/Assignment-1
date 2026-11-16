import { ProductCode } from '../models/ProductCode.js';
import { CodeBatch } from '../models/CodeBatch.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { PointTransaction } from '../models/PointTransaction.js';
import { FraudLog } from '../models/FraudLog.js';
import { Campaign } from '../models/Campaign.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';
import { logAdminActivity } from '../utils/auditLogger.js';
import { calculateRiskScore } from '../utils/fraudScorer.js';
import { apiResponse } from '../utils/apiResponse.js';

export const generateCodes = async (req, res, next) => {
  try {
    const { productId, count, customPoints, expiryMonths = 12 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return apiResponse.error(res, 'Target product not found.', [], 404);
    }

    const points = customPoints ? parseInt(customPoints, 10) : product.pointsPerBox;
    const batchId = `BATCH-${new Date().getFullYear()}-Q4-${Math.floor(1000 + Math.random() * 9000)}`;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + parseInt(expiryMonths, 10));

    const generatedPlaintextCodes = [];
    const dbRecords = [];

    // Generate cryptographically unique codes
    for (let i = 0; i < parseInt(count, 10); i++) {
      const plaintext = cryptoUtils.generateProductCode('BOX');
      const codeHash = cryptoUtils.hashProductCode(plaintext);

      generatedPlaintextCodes.push({
        code: plaintext,
        sku: product.sku,
        points,
        batchId,
        expiresAt: expiresAt.toISOString().substring(0, 10)
      });

      dbRecords.push({
        codeHash,
        codePrefix: 'BOX',
        productId: product._id,
        productName: product.productName,
        sku: product.sku,
        batchId,
        points,
        status: 'unused',
        expiresAt
      });
    }

    // Insert batch record
    await CodeBatch.create({
      batchId,
      productId: product._id,
      productName: product.productName,
      sku: product.sku,
      count: parseInt(count, 10),
      points,
      generatedBy: req.user._id,
      expiresAt
    });

    // Bulk insert into productCodes
    await ProductCode.insertMany(dbRecords);

    // Update product counter
    await Product.findByIdAndUpdate(product._id, {
      $inc: { totalCodesGenerated: parseInt(count, 10) }
    });

    await logAdminActivity({
      admin: req.user,
      actionType: 'GENERATE_CODES',
      module: 'Codes',
      targetId: batchId,
      description: `Generated ${count} cryptographic codes under batch ${batchId} for ${product.productName} (${points} pts each)`,
      metadata: { batchId, count: parseInt(count, 10), points, sku: product.sku },
      req
    });

    return apiResponse.success(
      res,
      `Successfully generated batch ${batchId} with ${count} unique product packaging codes.`,
      {
        batchId,
        product: {
          id: product._id,
          name: product.productName,
          sku: product.sku
        },
        count: parseInt(count, 10),
        points,
        expiresAt,
        // Plaintext codes are provided ONLY in this response for printing/export
        codes: generatedPlaintextCodes
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getCodes = async (req, res, next) => {
  try {
    const { status, batchId, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status.toLowerCase();
    if (batchId) query.batchId = batchId;
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { batchId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await ProductCode.countDocuments(query);
    const codes = await ProductCode.find(query)
      .select('-codeHash') // Never expose codeHash to clients
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return apiResponse.success(res, 'Product codes retrieved successfully.', {
      codes,
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

export const getCodeBatches = async (req, res, next) => {
  try {
    const batches = await CodeBatch.find().sort({ createdAt: -1 });
    return apiResponse.success(res, 'Code batches retrieved.', { batches });
  } catch (error) {
    next(error);
  }
};

export const exportBatchCSV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batch = await CodeBatch.findOne({ batchId: id });
    if (!batch) {
      return apiResponse.error(res, 'Batch not found.', [], 404);
    }

    const codes = await ProductCode.find({ batchId: id }).select('-codeHash');
    
    // Construct CSV
    let csv = 'BatchID,SKU,ProductName,Points,Status,GeneratedAt,ExpiresAt\n';
    codes.forEach(c => {
      csv += `"${c.batchId}","${c.sku}","${c.productName}",${c.points},"${c.status}","${c.generatedAt.toISOString()}","${c.expiresAt.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=batch_${id}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const blockCode = async (req, res, next) => {
  try {
    const code = await ProductCode.findById(req.params.id);
    if (!code) {
      return apiResponse.error(res, 'Code not found.', [], 404);
    }

    const previousStatus = code.status;
    code.status = 'blocked';
    await code.save();

    await logAdminActivity({
      admin: req.user,
      actionType: 'BLOCK_CODE',
      module: 'Codes',
      targetId: code._id,
      description: `Blocked packaging security code ${code._id} (Batch: ${code.batchId}, Product: ${code.productName})`,
      metadata: { batchId: code.batchId, sku: code.sku, previousStatus, status: 'blocked' },
      req
    });

    return apiResponse.success(res, 'Code successfully blocked.');
  } catch (error) {
    next(error);
  }
};

export const redeemCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Client';

    const normalizedCode = (code || '').trim().toUpperCase();
    const codeHash = cryptoUtils.hashProductCode(normalizedCode);

    // Look up code in DB
    const foundCode = await ProductCode.findOne({ codeHash });

    if (!foundCode) {
      // Record failed attempt for heuristic fraud monitoring
      const prevCount = await FraudLog.countDocuments({
        $or: [{ userId: req.user._id }, { ipAddress: clientIp }]
      });
      const { score, riskLevel } = calculateRiskScore({
        eventType: 'Brute Force Code Guessing',
        previousAttempts: prevCount
      });

      await FraudLog.create({
        userId: req.user._id,
        customerName: req.user.fullName,
        email: req.user.email,
        productCodeReference: normalizedCode,
        eventType: 'Brute Force Code Guessing',
        riskLevel,
        riskScore: score,
        ipAddress: clientIp,
        userAgent,
        description: `Submitted invalid/non-existent product code: ${normalizedCode}`
      });

      return apiResponse.error(res, 'Invalid product code. Please verify the code printed inside your box.', [], 400);
    }

    // Check status
    if (foundCode.status === 'redeemed') {
      const prevCount = await FraudLog.countDocuments({
        $or: [{ userId: req.user._id }, { ipAddress: clientIp }]
      });
      const { score, riskLevel } = calculateRiskScore({
        eventType: 'Duplicate Redemption Attempt',
        previousAttempts: prevCount
      });

      await FraudLog.create({
        userId: req.user._id,
        customerName: req.user.fullName,
        email: req.user.email,
        productCodeReference: normalizedCode,
        eventType: 'Duplicate Redemption Attempt',
        riskLevel,
        riskScore: score,
        ipAddress: clientIp,
        userAgent,
        targetedProduct: foundCode.productName,
        description: `Attempted to redeem already-used code from batch ${foundCode.batchId}. Previously redeemed at ${foundCode.redeemedAt}`
      });

      return apiResponse.error(
        res,
        `This code has already been redeemed on ${foundCode.redeemedAt ? foundCode.redeemedAt.toISOString().substring(0, 10) : 'earlier date'}.`,
        [],
        400
      );
    }

    if (foundCode.status === 'expired' || foundCode.expiresAt < new Date()) {
      return apiResponse.error(
        res,
        `This product code expired on ${foundCode.expiresAt.toISOString().substring(0, 10)}. Promotional period has ended.`,
        [],
        400
      );
    }

    if (foundCode.status === 'blocked') {
      return apiResponse.error(
        res,
        'Security Alert: This code has been blocked due to suspicious activity. Please contact factory support.',
        [],
        400
      );
    }

    // Atomic update to mark code as redeemed (prevents race condition & double redemption)
    const updatedCode = await ProductCode.findOneAndUpdate(
      { _id: foundCode._id, status: 'unused' },
      {
        status: 'redeemed',
        redeemedBy: req.user._id,
        redeemedByUserEmail: req.user.email,
        redeemedAt: new Date()
      },
      { new: true }
    );

    if (!updatedCode) {
      // Race condition occurred: another process redeemed this code in parallel
      return apiResponse.error(res, 'This code was redeemed concurrently by another request.', [], 409);
    }

    // Check for active promotional campaigns
    const now = new Date();
    const activeCampaigns = await Campaign.find({
      status: 'Active',
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { eligibleProducts: { $size: 0 } },
        { eligibleProducts: updatedCode.productId }
      ]
    }).sort({ multiplier: -1, bonusPoints: -1 });

    let appliedCampaign = null;
    let multiplier = 1;
    let bonusPoints = 0;

    if (activeCampaigns.length > 0) {
      appliedCampaign = activeCampaigns[0];
      multiplier = appliedCampaign.multiplier || 1;
      bonusPoints = appliedCampaign.bonusPoints || 0;

      // Update campaign counters
      const bonusCredited = (updatedCode.points * (multiplier - 1)) + bonusPoints;
      await Campaign.findByIdAndUpdate(appliedCampaign._id, {
        $inc: {
          totalRedemptionsCount: 1,
          totalBonusAwarded: bonusCredited
        }
      });
    }

    const basePoints = updatedCode.points;
    const pointsAwarded = (basePoints * multiplier) + bonusPoints;

    // Award points to user wallet atomically
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          availablePoints: pointsAwarded,
          totalPointsEarned: pointsAwarded,
          boxesRedeemed: 1
        }
      },
      { new: true }
    );

    // Record point transaction with campaign metadata
    const description = appliedCampaign
      ? `Redeemed product box code for ${updatedCode.productName} (Includes "${appliedCampaign.title}" bonus: +${pointsAwarded - basePoints} pts)`
      : `Redeemed product box code for ${updatedCode.productName}`;

    await PointTransaction.create({
      userId: req.user._id,
      userEmail: req.user.email,
      customerName: req.user.fullName,
      type: 'earned',
      flow: 'EARNED',
      points: pointsAwarded,
      source: 'CODE_REDEMPTION',
      referenceId: normalizedCode,
      description
    });

    // Update product redemption counter
    await Product.findByIdAndUpdate(updatedCode.productId, {
      $inc: { totalRedeemed: 1 }
    });

    const celebrationMessage = appliedCampaign
      ? `Congratulations! You received ${pointsAwarded} points (${basePoints} base + ${pointsAwarded - basePoints} "${appliedCampaign.title}" bonus).`
      : 'Congratulations! Points added successfully.';

    return apiResponse.success(
      res,
      celebrationMessage,
      {
        pointsEarned: pointsAwarded,
        basePoints,
        campaignBonus: pointsAwarded - basePoints,
        campaignName: appliedCampaign ? appliedCampaign.title : null,
        availablePoints: updatedUser.availablePoints,
        productName: updatedCode.productName,
        sku: updatedCode.sku
      }
    );
  } catch (error) {
    next(error);
  }
};
