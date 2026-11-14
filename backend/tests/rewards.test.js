import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';
import { Reward } from '../src/models/Reward.js';

setupTestDB();

describe('Rewards & Redemption API Tests', () => {
  let customerToken;
  let reward;

  beforeEach(async () => {
    // Customer has 100 signup points
    const regRes = await request(app).post('/api/auth/register').send({
      fullName: 'Vikram Patel',
      email: 'vikram@workshop.in',
      phone: '+91 98220 11234',
      password: 'password123',
      confirmPassword: 'password123'
    });
    customerToken = regRes.body.data.accessToken;

    reward = await Reward.create({
      name: '₹50 Discount Coupon',
      pointsRequired: 50,
      quantity: 10,
      category: 'Coupons',
      status: 'active'
    });
  });

  test('POST /api/rewards/:id/redeem - Successfully claims reward when customer has sufficient points', async () => {
    const res = await request(app)
      .post(`/api/rewards/${reward._id}/redeem`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.availablePoints).toBe(50); // 100 - 50 = 50
    expect(res.body.data.reward.quantity).toBe(9); // 10 - 1 = 9
    expect(res.body.data.redemption.redemptionCode).toBeDefined();
  });

  test('POST /api/rewards/:id/redeem - Rejects claim when points are insufficient', async () => {
    const expensiveReward = await Reward.create({
      name: 'Factory VIP Gift Box',
      pointsRequired: 500,
      quantity: 5,
      category: 'Exclusive Gifts',
      status: 'active'
    });

    const res = await request(app)
      .post(`/api/rewards/${expensiveReward._id}/redeem`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Insufficient points');
  });

  test('POST /api/rewards/:id/redeem - Rejects claim when reward is out of stock', async () => {
    const outOfStockReward = await Reward.create({
      name: 'Free Machine Oil Can',
      pointsRequired: 50,
      quantity: 0,
      category: 'Physical Products',
      status: 'active'
    });

    const res = await request(app)
      .post(`/api/rewards/${outOfStockReward._id}/redeem`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('out of stock');
  });
});
