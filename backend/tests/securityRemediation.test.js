import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';
import { Reward } from '../src/models/Reward.js';
import { Redemption } from '../src/models/Redemption.js';
import { ProductCode } from '../src/models/ProductCode.js';
import { Product } from '../src/models/Product.js';
import { AuditLog } from '../src/models/AuditLog.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import { cryptoUtils } from '../src/utils/cryptoUtils.js';

setupTestDB();

describe('Phase 2 Security & Architectural Remediation Verification', () => {
  const adminId = new mongoose.Types.ObjectId();
  const customerId = new mongoose.Types.ObjectId();

  const adminToken = jwt.sign({ id: adminId }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  const customerToken = jwt.sign({ id: customerId }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });

  beforeEach(async () => {
    // Seed Admin
    await User.create({
      _id: adminId,
      fullName: 'Super Admin',
      email: 'admin@factory.com',
      phone: '+919876543210',
      password: 'AdminPassword123!',
      role: 'admin',
      availablePoints: 0
    });

    // Seed Customer
    await User.create({
      _id: customerId,
      fullName: 'Test Customer',
      email: 'customer@factory.com',
      phone: '+919123456780',
      password: 'CustomerPassword123!',
      role: 'customer',
      availablePoints: 100,
      totalPointsEarned: 100,
      totalPointsRedeemed: 0
    });
  });

  describe('FINDING-SEC-02: Concurrency & Atomic Point Deduction', () => {
    test('Simultaneous claims cannot drive user balance negative (Race Condition Prevention)', async () => {
      const reward = await Reward.create({
        name: '₹100 Factory Coupon',
        description: 'Instant discount voucher',
        category: 'Coupons',
        pointsRequired: 100,
        quantity: 5,
        status: 'active'
      });

      // Fire 2 concurrent redemption requests when user has only 100 points
      const [res1, res2] = await Promise.all([
        request(app)
          .post(`/api/rewards/${reward._id}/redeem`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({ shippingAddress: { street: '123 Main St', city: 'Mumbai', state: 'MH', pincode: '400001' } }),
        request(app)
          .post(`/api/rewards/${reward._id}/redeem`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({ shippingAddress: { street: '123 Main St', city: 'Mumbai', state: 'MH', pincode: '400001' } })
      ]);

      const statuses = [res1.status, res2.status];
      expect(statuses).toContain(201);
      expect(statuses).toContain(400);

      // Verify final user state
      const finalUser = await User.findById(customerId);
      expect(finalUser.availablePoints).toBe(0);
      expect(finalUser.availablePoints).toBeGreaterThanOrEqual(0);

      // Verify reward stock decreased by exactly 1
      const finalReward = await Reward.findById(reward._id);
      expect(finalReward.quantity).toBe(4);
    });
  });

  describe('FINDING-LOGIC-01: Inventory Restoration on Rejection', () => {
    test('Rejecting a redemption order atomically restores inventory', async () => {
      const reward = await Reward.create({
        name: 'Physical Tool Kit',
        description: 'Heavy duty wrench set',
        category: 'Physical Products',
        pointsRequired: 50,
        quantity: 10,
        status: 'active'
      });

      const redemption = await Redemption.create({
        userId: customerId,
        customerName: 'Test Customer',
        userEmail: 'customer@factory.com',
        rewardId: reward._id,
        rewardName: reward.name,
        rewardCategory: reward.category,
        pointsSpent: 50,
        status: 'Pending',
        redemptionCode: 'VOUCH-TEST-1234'
      });

      // Admin updates fulfillment status to 'Rejected'
      const res = await request(app)
        .patch(`/api/redemptions/${redemption._id}/fulfillment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Rejected', rejectionReason: 'Out of regional delivery zone' });

      expect(res.status).toBe(200);

      // Reward inventory must be restored from 10 to 11
      const updatedReward = await Reward.findById(reward._id);
      expect(updatedReward.quantity).toBe(11);

      // Attempting to update a rejected order does not restore stock again (idempotent rejection guard)
      const repeatRes = await request(app)
        .patch(`/api/redemptions/${redemption._id}/fulfillment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Rejected', rejectionReason: 'Second rejection attempt' });
      expect(repeatRes.status).toBe(200);

      // Stock must remain 11 (never double incremented)
      const unchangedReward = await Reward.findById(reward._id);
      expect(unchangedReward.quantity).toBe(11);
    });
  });

  describe('FINDING-SEC-03: Mass Assignment Prevention', () => {
    test('PUT /api/rewards/:id ignores unauthorized fields (e.g. system properties)', async () => {
      const reward = await Reward.create({
        name: 'Factory Cap',
        description: 'Cotton cap',
        category: 'Physical Products',
        pointsRequired: 80,
        quantity: 20,
        status: 'active'
      });

      const res = await request(app)
        .put(`/api/rewards/${reward._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Factory Cap - Updated',
          unauthorizedField: 'MALICIOUS_DATA',
          __v: 99
        });

      expect(res.status).toBe(200);
      const updated = await Reward.findById(reward._id);
      expect(updated.name).toBe('Factory Cap - Updated');
      expect(updated.toObject().unauthorizedField).toBeUndefined();
    });
  });

  describe('FINDING-FEAT-01: Password Reset Lifecycle', () => {
    test('Forgot password generates token; reset password updates credential', async () => {
      // 1. Request reset
      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'customer@factory.com' });
      expect(forgotRes.status).toBe(200);

      const userWithToken = await User.findById(customerId);
      expect(userWithToken.resetPasswordToken).toBeDefined();

      // In real flow, user receives email with token. Here we test reset with valid token hash check
      // Raw token is checked by user sending token to reset-password
      // Let's generate a known token to test resetPassword directly
      const rawToken = 'test-reset-raw-token-1234567890';
      userWithToken.resetPasswordToken = cryptoUtils.hashToken(rawToken);
      userWithToken.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
      await userWithToken.save();

      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          password: 'NewStrongPassword456!'
        });
      expect(resetRes.status).toBe(200);

      // Verify login with new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer@factory.com',
          password: 'NewStrongPassword456!'
        });
      expect(loginRes.status).toBe(200);
    });
  });

  describe('FINDING-BUG-01: Optional Authentication on Public Endpoints', () => {
    test('Public visitors see active rewards; Admins see both active and inactive', async () => {
      await Reward.create([
        { name: 'Active Reward', description: 'Active desc', category: 'Coupons', pointsRequired: 50, quantity: 10, status: 'active' },
        { name: 'Draft Reward', description: 'Draft desc', category: 'Coupons', pointsRequired: 50, quantity: 10, status: 'inactive' }
      ]);

      // Unauthenticated visitor
      const unauthRes = await request(app).get('/api/rewards');
      expect(unauthRes.status).toBe(200);
      expect(unauthRes.body.data.rewards.length).toBe(1);
      expect(unauthRes.body.data.rewards[0].status).toBe('active');

      // Admin user
      const adminRes = await request(app)
        .get('/api/rewards')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data.rewards.length).toBe(2);
    });
  });

  describe('FINDING-SEC-04: ReDoS / Regex Injection Protection', () => {
    test('Malicious regex characters do not crash search queries', async () => {
      await Product.create({
        productName: 'Hydraulic Cylinder Pump',
        sku: 'PUMP-001',
        category: 'Pumps',
        pointsPerBox: 20
      });

      const evilRegexQueries = [
        '((((((a+)+)+)+)+)+)$',
        '.*.*.*.*.*.*.*.*.*.*.*.*!?',
        '[*+?^${}()|[\\]\\]'
      ];

      for (const evilQuery of evilRegexQueries) {
        const res = await request(app).get(`/api/products?search=${encodeURIComponent(evilQuery)}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data.products)).toBe(true);
      }
    });
  });

  describe('FINDING-SEC-05: Audit Logging for Sensitive Operations', () => {
    test('blockCode logs an entry in AuditLog', async () => {
      const prod = await Product.create({
        productName: 'Test Item',
        sku: 'SKU-001',
        category: 'General',
        pointsPerBox: 10
      });

      const code = await ProductCode.create({
        codeHash: cryptoUtils.hashToken('TEST-CODE-12345'),
        codePrefix: 'BOX',
        productId: prod._id,
        productName: prod.productName,
        sku: prod.sku,
        batchId: 'BATCH-001',
        points: 50,
        status: 'unused',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      const res = await request(app)
        .post(`/api/codes/${code._id}/block`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Suspicious packaging batch defect' });

      expect(res.status).toBe(200);

      const log = await AuditLog.findOne({ actionType: 'BLOCK_CODE' });
      expect(log).not.toBeNull();
      expect(log.adminId.toString()).toBe(adminId.toString());
      expect(log.targetId).toBe(code._id.toString());
    });

    test('adjustPoints logs an entry in AuditLog', async () => {
      const res = await request(app)
        .post('/api/points/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: customerId.toString(),
          points: 50,
          reason: 'Manual goodwill credit'
        });

      expect(res.status).toBe(200);

      const log = await AuditLog.findOne({ actionType: 'POINTS_ADJUSTED' });
      expect(log).not.toBeNull();
      expect(log.adminId.toString()).toBe(adminId.toString());
      expect(log.targetId).toBe(customerId.toString());
    });
  });

  describe('FINDING-VAL-01: Enhanced Credential & Phone Validation', () => {
    test('Rejects weak password (< 8 chars or missing numbers)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Weak User',
          email: 'weak@factory.com',
          phone: '+919876543210',
          password: 'short',
          confirmPassword: 'short'
        });

      expect(res.status).toBe(422);
    });

    test('Rejects invalid phone number format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Bad Phone',
          email: 'phone@factory.com',
          phone: '123',
          password: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!'
        });

      expect(res.status).toBe(422);
    });

    test('Accepts compliant password and phone with bonus points credited', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Valid User',
          email: 'valid.user@factory.com',
          phone: '+91 98765 43210',
          password: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.availablePoints).toBe(100);
    });
  });
});
