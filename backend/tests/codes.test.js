import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { ProductCode } from '../src/models/ProductCode.js';
import { cryptoUtils } from '../src/utils/cryptoUtils.js';

setupTestDB();

describe('Code Generation & Secure Redemption API Tests', () => {
  let adminToken;
  let customerToken;
  let product;

  beforeEach(async () => {
    // Admin
    await User.create({
      fullName: 'Factory Admin',
      email: 'admin@factory.io',
      phone: '+91 99999 00001',
      password: 'password123',
      role: 'admin'
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@factory.io',
      password: 'password123'
    });
    adminToken = adminLogin.body.data.accessToken;

    // Customer
    const custReg = await request(app).post('/api/auth/register').send({
      fullName: 'Customer Rohit',
      email: 'rohit@workshop.in',
      phone: '+91 99999 00002',
      password: 'password123',
      confirmPassword: 'password123'
    });
    customerToken = custReg.body.data.accessToken;

    // Product
    product = await Product.create({
      productName: 'Heavy Duty Bearings',
      sku: 'SKU-BRG-401',
      category: 'Mechanical',
      pointsPerBox: 100,
      price: 1850
    });
  });

  test('POST /api/codes/generate - Admin generates batch of 10 codes', async () => {
    const res = await request(app)
      .post('/api/codes/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productId: product._id,
        count: 10,
        expiryMonths: 12
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.codes.length).toBe(10);
    expect(res.body.data.codes[0].code).toMatch(/^BOX-[2-9A-Z]{4}-[2-9A-Z]{4}$/);

    // Verify DB does NOT store plaintext code
    const stored = await ProductCode.findOne({ batchId: res.body.data.batchId });
    expect(stored.codeHash).toBeDefined();
    expect(stored.code).toBeUndefined(); // Plaintext must never exist in DB model
  });

  test('POST /api/codes/redeem - Customer successfully redeems valid code', async () => {
    // 1. Generate code as admin
    const genRes = await request(app)
      .post('/api/codes/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productId: product._id,
        count: 1
      });

    const plaintextCode = genRes.body.data.codes[0].code;

    // 2. Customer redeems
    const redeemRes = await request(app)
      .post('/api/codes/redeem')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: plaintextCode });

    expect(redeemRes.status).toBe(200);
    expect(redeemRes.body.success).toBe(true);
    expect(redeemRes.body.data.pointsEarned).toBe(100);
    // User started with 100 signup points + 100 redeemed = 200 available points
    expect(redeemRes.body.data.availablePoints).toBe(200);

    // 3. Verify code status in DB is now 'redeemed'
    const codeHash = cryptoUtils.hashProductCode(plaintextCode);
    const updatedCode = await ProductCode.findOne({ codeHash });
    expect(updatedCode.status).toBe('redeemed');
  });

  test('POST /api/codes/redeem - Rejects duplicate code redemption', async () => {
    const genRes = await request(app)
      .post('/api/codes/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productId: product._id,
        count: 1
      });

    const plaintextCode = genRes.body.data.codes[0].code;

    // First redemption: succeeds
    await request(app)
      .post('/api/codes/redeem')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: plaintextCode });

    // Second redemption: fails
    const secondRes = await request(app)
      .post('/api/codes/redeem')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: plaintextCode });

    expect(secondRes.status).toBe(400);
    expect(secondRes.body.message).toContain('already been redeemed');
  });

  test('POST /api/codes/redeem - Rejects invalid/non-existent code and logs fraud attempt', async () => {
    const res = await request(app)
      .post('/api/codes/redeem')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: 'BOX-FAKE-9999' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid product code');
  });

  test('POST /api/codes/redeem - Rejects expired code', async () => {
    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() - 2);

    const codeHash = cryptoUtils.hashProductCode('BOX-EXPD-1234');
    await ProductCode.create({
      codeHash,
      codePrefix: 'BOX',
      productId: product._id,
      productName: product.productName,
      sku: product.sku,
      batchId: 'BATCH-EXPIRED',
      points: 100,
      status: 'expired',
      expiresAt: expiredDate
    });

    const res = await request(app)
      .post('/api/codes/redeem')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ code: 'BOX-EXPD-1234' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('expired');
  });
});
