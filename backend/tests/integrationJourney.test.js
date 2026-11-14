import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Reward } from '../src/models/Reward.js';
import { ProductCode } from '../src/models/ProductCode.js';
import { Setting } from '../src/models/Setting.js';

setupTestDB();

describe('Phase 16 — Integrated End-to-End Application Workflows', () => {

  let adminToken;
  let customerToken;
  let createdProductId;
  let generatedPackagingCode;
  let createdRewardId;

  // Setup initial admin account
  beforeEach(async () => {
    await Setting.create({ key: 'global_config', plantName: 'Apex Precision' });

    const admin = await User.create({
      fullName: 'Harish Patel',
      email: 'admin@factory.io',
      phone: '+91 98220 00001',
      password: 'AdminSecurePassword123!',
      role: 'admin'
    });

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@factory.io', password: 'AdminSecurePassword123!' });
    
    adminToken = adminLoginRes.body.data.accessToken;
  });

  describe('Customer Journey Integration', () => {
    it('executes full end-to-end customer lifecycle: register -> login -> balance -> redeem code -> claim reward -> audit history', async () => {
      // 1. Admin prepares a product and a batch of codes
      const prodRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productName: 'Heavy Duty Bearings Box',
          sku: `SKU-INT-${Date.now()}`,
          category: 'Mechanical',
          pointsPerBox: 150,
          price: 1200
        });
      expect(prodRes.status).toBe(201);
      const productId = prodRes.body.data.product._id;

      const codeGenRes = await request(app)
        .post('/api/codes/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId,
          count: 2,
          customPoints: 150
        });
      expect(codeGenRes.status).toBe(201);
      const testCode = codeGenRes.body.data.codes[0].code;

      // Also admin creates a reward
      const rewardRes = await request(app)
        .post('/api/rewards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '₹100 Workshop Discount Coupon',
          category: 'Coupons',
          pointsRequired: 100,
          quantity: 20
        });
      expect(rewardRes.status).toBe(201);
      const rewardId = rewardRes.body.data.reward._id;

      // STEP 1: Customer registers
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Sanjay Verma',
          email: 'sanjay.verma@workshop.in',
          phone: '+91 98222 33445',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          businessName: 'Verma Auto Works',
          city: 'Nagpur',
          state: 'Maharashtra'
        });
      expect(regRes.status).toBe(201);
      expect(regRes.body.data.user.availablePoints).toBe(100); // 100 welcome bonus points

      // STEP 2: Customer logs in
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'sanjay.verma@workshop.in',
          password: 'Password123!'
        });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.accessToken).toBeDefined();
      customerToken = loginRes.body.data.accessToken;

      // STEP 3: Customer views dashboard / balance
      const balanceRes = await request(app)
        .get('/api/points/balance')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(balanceRes.status).toBe(200);
      const initialBalance = balanceRes.body.data.balance ? balanceRes.body.data.balance.availablePoints : balanceRes.body.data.availablePoints;
      expect(initialBalance).toBe(100);

      // STEP 4: Customer redeems a product code
      const redeemCodeRes = await request(app)
        .post('/api/codes/redeem')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ code: testCode });
      expect(redeemCodeRes.status).toBe(200);
      expect(redeemCodeRes.body.data.pointsEarned).toBe(150);
      expect(redeemCodeRes.body.data.availablePoints).toBe(250); // 100 bonus + 150 code

      // STEP 5: Points update verified in database
      const updatedBalanceRes = await request(app)
        .get('/api/points/balance')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(updatedBalanceRes.status).toBe(200);
      const updatedBalance = updatedBalanceRes.body.data.balance ? updatedBalanceRes.body.data.balance.availablePoints : updatedBalanceRes.body.data.availablePoints;
      expect(updatedBalance).toBe(250);

      // STEP 6: Customer redeems a reward
      const claimRes = await request(app)
        .post(`/api/rewards/${rewardId}/redeem`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(claimRes.status).toBe(201);
      expect(claimRes.body.data.redemption.rewardName).toBe('₹100 Workshop Discount Coupon');
      expect(claimRes.body.data.availablePoints).toBe(150); // 250 - 100

      // STEP 7: Redemption history updates
      const historyRes = await request(app)
        .get('/api/points/history')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data.transactions.length).toBeGreaterThanOrEqual(2);

      const redemptionsList = await request(app)
        .get('/api/redemptions/my')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(redemptionsList.status).toBe(200);
      expect(redemptionsList.body.data.redemptions.length).toBe(1);
    });
  });

  describe('Admin Journey Integration', () => {
    it('executes full end-to-end admin lifecycle: login -> dashboard -> create product -> generate codes -> create reward -> view customers -> monitor fraud', async () => {
      // STEP 1: Admin logs in
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@factory.io',
          password: 'AdminSecurePassword123!'
        });
      expect(adminLogin.status).toBe(200);
      const token = adminLogin.body.data.accessToken;

      // STEP 2: Admin views live dashboard
      const dashRes = await request(app)
        .get('/api/admin/analytics/dashboard')
        .set('Authorization', `Bearer ${token}`);
      expect(dashRes.status).toBe(200);
      expect(dashRes.body.data.stats).toBeDefined();

      // STEP 3: Admin creates a product
      const newProdRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productName: 'Tungsten CNC Cutting Tips',
          sku: `SKU-CNC-${Date.now()}`,
          category: 'Cutting Tools',
          pointsPerBox: 200,
          price: 4500,
          description: 'Industrial precision carbide inserts'
        });
      expect(newProdRes.status).toBe(201);
      const prodId = newProdRes.body.data.product._id;

      // STEP 4: Admin generates product codes
      const genRes = await request(app)
        .post('/api/codes/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: prodId,
          count: 5,
          customPoints: 200,
          expiryMonths: 18
        });
      expect(genRes.status).toBe(201);
      expect(genRes.body.data.codes.length).toBe(5);

      // STEP 5: Admin creates a reward
      const rewRes = await request(app)
        .post('/api/rewards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Professional Hydraulic Caliper Tool',
          category: 'Physical Products',
          pointsRequired: 500,
          quantity: 15,
          description: 'Digital stainless steel precision measuring vernier caliper'
        });
      expect(rewRes.status).toBe(201);
      expect(rewRes.body.data.reward.name).toBe('Professional Hydraulic Caliper Tool');

      // STEP 6: Admin views customer records
      const custDirRes = await request(app)
        .get('/api/admin/analytics/directory')
        .set('Authorization', `Bearer ${token}`);
      expect(custDirRes.status).toBe(200);
      expect(Array.isArray(custDirRes.body.data.customers)).toBe(true);

      // STEP 7: Admin monitors fraud alerts (trigger a duplicate attempt first)
      const validCode = genRes.body.data.codes[0].code;
      // Trigger an invalid code guess to generate a real fraud log
      await request(app)
        .post('/api/codes/redeem')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'INVALID-FAKE-CODE-9999' });

      const fraudRes = await request(app)
        .get('/api/admin/fraud')
        .set('Authorization', `Bearer ${token}`);
      expect(fraudRes.status).toBe(200);
      expect(fraudRes.body.data.logs).toBeDefined();
    });
  });
});
