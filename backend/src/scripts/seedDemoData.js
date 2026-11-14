import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Reward } from '../models/Reward.js';
import { ProductCode } from '../models/ProductCode.js';
import { CodeBatch } from '../models/CodeBatch.js';
import { Setting } from '../models/Setting.js';
import { PointTransaction } from '../models/PointTransaction.js';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { cryptoUtils } from '../utils/cryptoUtils.js';
import { logger } from '../utils/logger.js';

const seedDemoData = async () => {
  try {
    await connectDB();
    logger.info('Clearing existing demo collections...');

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Reward.deleteMany({}),
      ProductCode.deleteMany({}),
      CodeBatch.deleteMany({}),
      Setting.deleteMany({}),
      PointTransaction.deleteMany({})
    ]);

    // 1. Seed Admin
    const admin = await User.create({
      fullName: 'Harish Patel (Factory Owner)',
      email: env.ADMIN_EMAIL.toLowerCase(),
      phone: '+91 98220 00001',
      password: env.ADMIN_PASSWORD,
      role: 'admin',
      businessName: 'Apex Precision Bearings & Hydraulics Ltd.',
      city: 'Pune',
      state: 'Maharashtra',
      status: 'active'
    });
    logger.info(`Seeded Admin: ${admin.email}`);

    // 2. Seed Customer (Rahul Sharma)
    const customer = await User.create({
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@workshop.in',
      phone: '+91 98765 43210',
      password: 'password123',
      role: 'customer',
      availablePoints: 1250,
      totalPointsEarned: 2500,
      totalPointsRedeemed: 1250,
      boxesRedeemed: 25,
      tier: 'Gold VIP',
      businessName: 'Sharma Precision Engineering Works',
      city: 'Pune',
      state: 'Maharashtra',
      status: 'active'
    });
    logger.info(`Seeded Customer: ${customer.email}`);

    // 3. Seed Products
    const products = await Product.insertMany([
      {
        productName: 'Industrial Heavy Duty Bearing Box (Set of 4)',
        sku: 'SKU-HDB-401',
        category: 'Mechanical Components',
        pointsPerBox: 100,
        price: 1850,
        status: 'active',
        totalCodesGenerated: 5000,
        totalRedeemed: 2140,
        description: 'High-grade alloy steel ball bearings engineered for high-RPM industrial gearboxes.'
      },
      {
        productName: 'Precision Hydraulic Valve Seal Pack',
        sku: 'SKU-HVS-108',
        category: 'Seals & Gaskets',
        pointsPerBox: 50,
        price: 920,
        status: 'active',
        totalCodesGenerated: 7500,
        totalRedeemed: 4320,
        description: 'Heat-resistant fluorocarbon elastomeric O-rings and fluid seals for hydraulic lines.'
      },
      {
        productName: 'Tungsten Carbide CNC Drill Bit Set',
        sku: 'SKU-TCD-550',
        category: 'Cutting Tools',
        pointsPerBox: 150,
        price: 3400,
        status: 'active',
        totalCodesGenerated: 3200,
        totalRedeemed: 1890,
        description: 'Multi-flute solid carbide high-speed tooling for aerospace & automotive machining.'
      }
    ]);
    logger.info(`Seeded ${products.length} Products`);

    // 4. Seed Rewards
    const rewards = await Reward.insertMany([
      {
        name: '₹50 Discount Coupon',
        pointsRequired: 50,
        category: 'Coupons',
        quantity: 450,
        status: 'active',
        description: 'Instant ₹50 coupon applicable on any retail partner product box purchase.',
        tag: 'Instant Credit'
      },
      {
        name: '₹100 Discount Coupon',
        pointsRequired: 100,
        category: 'Coupons',
        quantity: 280,
        status: 'active',
        description: 'Flat ₹100 rebate voucher valid across all verified factory dealer outlets.',
        tag: 'Most Popular'
      },
      {
        name: 'Free Hydraulic Valve Seal Pack',
        pointsRequired: 150,
        category: 'Physical Products',
        quantity: 95,
        status: 'active',
        description: 'Direct doorstep delivery of one complete boxed Hydraulic Valve Seal Pack.',
        tag: 'Factory Direct'
      },
      {
        name: 'Industrial Heavy-Duty Safety Kit',
        pointsRequired: 250,
        category: 'Safety Gear',
        quantity: 120,
        status: 'active',
        description: 'Anti-fog polycarbonate goggles, high-visibility vest, and ANSI-certified gloves.',
        tag: 'Protection'
      },
      {
        name: 'Premium Factory Gift Box',
        pointsRequired: 500,
        category: 'Exclusive Gifts',
        quantity: 40,
        status: 'active',
        description: 'Curated luxury gift crate with insulated thermal flask and engraved multi-tool.',
        tag: 'VIP Exclusive'
      }
    ]);
    logger.info(`Seeded ${rewards.length} Rewards`);

    // 5. Seed Predefined Test Codes
    // BOX-GOLD-8899 (Valid unused code)
    // BOX-TOOL-7711 (Valid unused code)
    // BOX-USED-5521 (Already redeemed code)
    // BOX-EXPD-9900 (Expired code)
    const expiryNextYear = new Date();
    expiryNextYear.setFullYear(expiryNextYear.getFullYear() + 1);

    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() - 2);

    const testCodes = [
      {
        code: 'BOX-GOLD-8899',
        productId: products[0]._id,
        productName: products[0].productName,
        sku: products[0].sku,
        points: 100,
        batchId: 'BATCH-2026-Q4-01',
        status: 'unused',
        expiresAt: expiryNextYear
      },
      {
        code: 'BOX-TOOL-7711',
        productId: products[2]._id,
        productName: products[2].productName,
        sku: products[2].sku,
        points: 150,
        batchId: 'BATCH-2026-Q4-02',
        status: 'unused',
        expiresAt: expiryNextYear
      },
      {
        code: 'BOX-USED-5521',
        productId: products[1]._id,
        productName: products[1].productName,
        sku: products[1].sku,
        points: 50,
        batchId: 'BATCH-2026-Q3-09',
        status: 'redeemed',
        redeemedBy: customer._id,
        redeemedByUserEmail: customer.email,
        redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expiresAt: expiryNextYear
      },
      {
        code: 'BOX-EXPD-9900',
        productId: products[0]._id,
        productName: products[0].productName,
        sku: products[0].sku,
        points: 100,
        batchId: 'BATCH-2025-Q1-01',
        status: 'expired',
        expiresAt: expiredDate
      }
    ];

    for (const tc of testCodes) {
      const codeHash = cryptoUtils.hashProductCode(tc.code);
      await ProductCode.create({
        codeHash,
        codePrefix: 'BOX',
        productId: tc.productId,
        productName: tc.productName,
        sku: tc.sku,
        batchId: tc.batchId,
        points: tc.points,
        status: tc.status,
        expiresAt: tc.expiresAt,
        redeemedBy: tc.redeemedBy || null,
        redeemedByUserEmail: tc.redeemedByUserEmail || null,
        redeemedAt: tc.redeemedAt || null
      });
    }
    logger.info('Seeded Predefined Test Codes (BOX-GOLD-8899, BOX-TOOL-7711, BOX-USED-5521, BOX-EXPD-9900)');

    // 6. Seed Setting
    await Setting.create({ key: 'global_config' });

    logger.info('Demo seed completed successfully!');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding demo data:', error);
    process.exit(1);
  }
};

seedDemoData();
