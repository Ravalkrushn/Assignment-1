import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { ProductCode } from '../src/models/ProductCode.js';
import { Reward } from '../src/models/Reward.js';
import { Redemption } from '../src/models/Redemption.js';
import { Campaign } from '../src/models/Campaign.js';
import { FraudLog } from '../src/models/FraudLog.js';
import { SupportTicket } from '../src/models/SupportTicket.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { cryptoUtils } from '../src/utils/cryptoUtils.js';

setupTestDB();

describe('Five Master Feature Enhancements Integration Tests', () => {
  let adminToken;
  let customerToken;
  let customerId;
  let otherCustomerToken;
  let product;
  let reward;

  beforeEach(async () => {
    // 1. Admin
    await User.create({
      fullName: 'Chief Administrator',
      email: 'admin@loyaltybox.com',
      phone: '+91 99999 11111',
      password: 'password123',
      role: 'admin'
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@loyaltybox.com',
      password: 'password123'
    });
    adminToken = adminLogin.body.data.accessToken;

    // 2. Primary Customer
    const custReg = await request(app).post('/api/auth/register').send({
      fullName: 'Vikram Mechanic',
      email: 'vikram@auto.in',
      phone: '+91 99999 22222',
      password: 'password123',
      confirmPassword: 'password123'
    });
    customerToken = custReg.body.data.accessToken;
    customerId = custReg.body.data.user.id || custReg.body.data.user._id;

    // Credit starting points to customer
    await User.findByIdAndUpdate(customerId, { availablePoints: 1000, totalPointsEarned: 1000 });

    // 3. Secondary Customer (for isolation testing)
    const otherReg = await request(app).post('/api/auth/register').send({
      fullName: 'Other Mechanic',
      email: 'other@auto.in',
      phone: '+91 99999 33333',
      password: 'password123',
      confirmPassword: 'password123'
    });
    otherCustomerToken = otherReg.body.data.accessToken;

    // 4. Base Product
    product = await Product.create({
      productName: 'Precision Filter Box',
      sku: 'SKU-FLTR-100',
      category: 'Filters',
      pointsPerBox: 100,
      price: 1200
    });

    // 5. Base Reward (Physical Product)
    reward = await Reward.create({
      name: 'Digital Multimeter',
      description: 'Professional high precision electrical tester',
      category: 'Physical Products',
      pointsRequired: 400,
      quantity: 10,
      status: 'active'
    });
  });

  // =========================================================================
  // FEATURE 1: Reward Fulfillment Management
  // =========================================================================
  describe('Feature 1: Reward Fulfillment Workflow', () => {
    let redemptionId;

    beforeEach(async () => {
      // Customer claims reward (costs 400 points)
      const res = await request(app)
        .post(`/api/rewards/${reward._id}/redeem`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          deliveryAddress: '12 Workshop Road, Pune, Maharashtra 411001'
        });
      redemptionId = res.body.data.redemption._id || res.body.data.redemption.id;
    });

    test('Fulfillment lifecycle: Pending -> Approved -> Processing -> Shipped -> Delivered', async () => {
      // 1. Pending -> Approved
      let res = await request(app)
        .patch(`/api/redemptions/${redemptionId}/fulfillment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Approved', adminNotes: 'Verified inventory stock' });
      expect(res.status).toBe(200);
      expect(res.body.data.redemption.status).toBe('Approved');

      // 2. Approved -> Processing
      res = await request(app)
        .patch(`/api/redemptions/${redemptionId}/fulfillment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Processing' });
      expect(res.status).toBe(200);
      expect(res.body.data.redemption.status).toBe('Processing');

      // 3. Processing -> Shipped with courier info
      res = await request(app)
        .patch(`/api/redemptions/${redemptionId}/fulfillment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Shipped',
          carrier: 'BlueDart Express',
          trackingNumber: 'BD-99882233',
          expectedDeliveryDate: '2026-12-01'
        });
      expect(res.status).toBe(200);
      expect(res.body.data.redemption.status).toBe('Shipped');
      expect(res.body.data.redemption.trackingNumber).toBe('BD-99882233');

      // 4. Shipped -> Delivered
      res = await request(app)
        .patch(`/api/redemptions/${redemptionId}/fulfillment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Delivered' });
      expect(res.status).toBe(200);
      expect(res.body.data.redemption.status).toBe('Delivered');

      // Customer view has complete timeline
      const custView = await request(app)
        .get(`/api/redemptions/${redemptionId}`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(custView.status).toBe(200);
      expect(custView.body.data.redemption.timeline.length).toBeGreaterThanOrEqual(4);
    });

    test('Rejection workflow: Points refunded atomically to customer', async () => {
      // Customer starting balance was 1000 - 400 = 600
      let cust = await User.findById(customerId);
      expect(cust.availablePoints).toBe(600);

      // Admin rejects redemption with reason
      const res = await request(app)
        .patch(`/api/redemptions/${redemptionId}/fulfillment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Rejected',
          rejectionReason: 'Item temporarily out of stock from manufacturer'
        });
      expect(res.status).toBe(200);
      expect(res.body.data.redemption.status).toBe('Rejected');

      // Verify points were refunded
      cust = await User.findById(customerId);
      expect(cust.availablePoints).toBe(1000);
    });

    test('Invalid status transition is rejected with 400', async () => {
      const res = await request(app)
        .patch(`/api/redemptions/${redemptionId}/fulfillment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Delivered' }); // Skipping straight from Pending to Delivered
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid fulfillment status transition/);
    });
  });

  // =========================================================================
  // FEATURE 2: Admin Audit Trail
  // =========================================================================
  describe('Feature 2: Admin Audit Trail', () => {
    test('Logs administrative actions and restricts access to admin only', async () => {
      // Create a product as admin (triggers audit log)
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productName: 'Heavy Brake Pads',
          sku: 'SKU-BRK-990',
          category: 'Brakes',
          pointsPerBox: 150,
          price: 2400
        });

      // Admin queries audit logs
      const auditRes = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(auditRes.status).toBe(200);
      expect(auditRes.body.success).toBe(true);
      expect(auditRes.body.data.logs.length).toBeGreaterThanOrEqual(1);

      const latestLog = auditRes.body.data.logs[0];
      expect(latestLog.module).toBe('Products');
      expect(latestLog.actionType).toBe('CREATE_PRODUCT');

      // Customer attempt to query audit logs must be forbidden (403)
      const forbiddenRes = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(forbiddenRes.status).toBe(403);
    });
  });

  // =========================================================================
  // FEATURE 3: Advanced Fraud Investigation
  // =========================================================================
  describe('Feature 3: Advanced Fraud Investigation & Risk Scoring', () => {
    test('Calculates deterministic risk score, logs investigation note, and blocks abuse', async () => {
      // Simulate failed scans to trigger fraud log
      await request(app)
        .post('/api/codes/redeem')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ code: 'FAKE-INVALID-CODE-001' });

      // Admin fetches fraud logs
      const logsRes = await request(app)
        .get('/api/admin/fraud')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(logsRes.status).toBe(200);
      expect(logsRes.body.data.logs.length).toBeGreaterThanOrEqual(1);

      const log = logsRes.body.data.logs[0];
      expect(typeof log.riskScore).toBe('number');
      expect(log.riskScore).toBeGreaterThanOrEqual(0);
      expect(log.riskScore).toBeLessThanOrEqual(100);

      // Admin records investigation note
      const noteRes = await request(app)
        .post(`/api/admin/fraud/${log._id}/notes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Suspicious repetitive brute force scan pattern verified by NOC' });
      expect(noteRes.status).toBe(200);
      expect(noteRes.body.data.log.investigationNotes.length).toBe(1);

      // Admin blocks customer
      const blockRes = await request(app)
        .post('/api/admin/fraud/block-customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: customerId, reason: 'Brute-force scan pattern abuse' });
      expect(blockRes.status).toBe(200);

      // Verify customer status changed to suspended
      const blockedCust = await User.findById(customerId);
      expect(blockedCust.status).toBe('suspended');

      // Attempting to redeem while suspended returns 403
      const blockedAttempt = await request(app)
        .post('/api/codes/redeem')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ code: 'ANY-CODE' });
      expect(blockedAttempt.status).toBe(403);

      // Admin unblocks customer
      const unblockRes = await request(app)
        .post('/api/admin/fraud/unblock-customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: customerId });
      expect(unblockRes.status).toBe(200);

      const unblockedCust = await User.findById(customerId);
      expect(unblockedCust.status).toBe('active');
    });
  });

  // =========================================================================
  // FEATURE 4: Reward Campaign Management
  // =========================================================================
  describe('Feature 4: Reward Campaign Multiplier & Bonus Points', () => {
    test('Applies 2x multiplier and bonus points during active campaign', async () => {
      // Admin creates active Double Points Campaign
      const now = new Date();
      const campaignRes = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Diwali Double Delight',
          description: 'Earn 2x points on all filter boxes',
          campaignType: 'Double Points',
          multiplier: 2,
          bonusPoints: 50,
          eligibleProducts: [product._id],
          startDate: new Date(now.getTime() - 3600000).toISOString(),
          endDate: new Date(now.getTime() + 86400000).toISOString(),
          status: 'Active'
        });
      expect(campaignRes.status).toBe(201);
      const campaignId = campaignRes.body.data.campaign._id;

      // Generate a valid code for product (basePoints = 100)
      const rawCode = 'BOX-CAMP-1234';
      const codeHash = cryptoUtils.hashProductCode(rawCode);
      await ProductCode.create({
        code: rawCode,
        codeHash,
        productId: product._id,
        productName: product.productName,
        sku: product.sku,
        points: 100,
        status: 'unused',
        batchId: 'BATCH-CAMP-01',
        expiresAt: new Date(Date.now() + 100000000)
      });

      // Customer redeems code during active campaign
      // Expected points: (100 * 2) + 50 = 250 points
      const custBefore = await User.findById(customerId);
      const startPoints = custBefore.availablePoints;

      const redeemRes = await request(app)
        .post('/api/codes/redeem')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ code: rawCode });
      expect(redeemRes.status).toBe(200);
      expect(redeemRes.body.data.pointsEarned).toBe(250);
      expect(redeemRes.body.data.campaignBonus).toBe(150);

      // Verify user received 250 points
      const custAfter = await User.findById(customerId);
      expect(custAfter.availablePoints).toBe(startPoints + 250);

      // Verify campaign counters incremented
      const updatedCampaign = await Campaign.findById(campaignId);
      expect(updatedCampaign.totalRedemptionsCount).toBe(1);
      expect(updatedCampaign.totalBonusAwarded).toBe(150); // 100 extra from 2x + 50 flat bonus = 150 bonus
    });
  });

  // =========================================================================
  // FEATURE 5: Customer Support & Dispute Management
  // =========================================================================
  describe('Feature 5: Customer Support & Dispute Management', () => {
    test('Ticket conversation thread with private internal notes isolation', async () => {
      // 1. Customer creates ticket
      const createRes = await request(app)
        .post('/api/support')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          category: 'Code Scan Issue',
          subject: 'Scratched box code illegible',
          description: 'Purchased filter box from authorized dealer, foil was scratched',
          relatedCode: 'BOX-SCRATCH-01',
          priority: 'High'
        });
      expect(createRes.status).toBe(201);
      const ticketId = createRes.body.data.ticket._id;

      // 2. Admin adds private internal note (not visible to customer)
      const internalNoteRes = await request(app)
        .post(`/api/support/${ticketId}/reply`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          message: 'Contacted dealer distributor to cross-reference dispatch batch numbers',
          isInternalNote: true
        });
      expect(internalNoteRes.status).toBe(200);

      // 3. Admin replies to customer
      const adminReplyRes = await request(app)
        .post(`/api/support/${ticketId}/reply`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          message: 'Hello Vikram, we are verifying with distributor. Please send box photo.',
          isInternalNote: false
        });
      expect(adminReplyRes.status).toBe(200);

      // 4. Customer views ticket: Must NEVER receive internal notes!
      const customerView = await request(app)
        .get(`/api/support/${ticketId}`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(customerView.status).toBe(200);
      const custMessages = customerView.body.data.ticket.messages;
      expect(custMessages.length).toBe(2); // Initial description + public reply
      expect(custMessages.some(m => m.message.includes('Hello Vikram'))).toBe(true);
      expect(custMessages.some(m => m.isInternalNote)).toBe(false);

      // 5. Admin views ticket: sees both internal notes and public replies
      const adminView = await request(app)
        .get(`/api/support/${ticketId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminView.status).toBe(200);
      expect(adminView.body.data.ticket.messages.length).toBe(3);

      // 6. Security Isolation: Another customer cannot access Vikram's ticket
      const unauthorizedRes = await request(app)
        .get(`/api/support/${ticketId}`)
        .set('Authorization', `Bearer ${otherCustomerToken}`);
      expect(unauthorizedRes.status).toBe(403);

      // 7. Admin updates ticket status to Resolved
      const statusRes = await request(app)
        .patch(`/api/support/${ticketId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Resolved' });
      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.ticket.status).toBe('Resolved');
    });
  });
});
