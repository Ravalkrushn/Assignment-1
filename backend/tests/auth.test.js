import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';

setupTestDB();

describe('Authentication API Tests', () => {
  const sampleCustomer = {
    fullName: 'Rohan Sharma',
    email: 'rohan@workshop.in',
    phone: '+91 99887 76655',
    password: 'password123',
    confirmPassword: 'password123',
    businessName: 'Rohan Auto Spares'
  };

  test('POST /api/auth/register - Successfully registers customer with 100 signup bonus points', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleCustomer);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(sampleCustomer.email);
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data.user.availablePoints).toBe(100);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('POST /api/auth/register - Rejects registration when email is duplicated', async () => {
    await request(app).post('/api/auth/register').send(sampleCustomer);

    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send(sampleCustomer);

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  test('POST /api/auth/register - Rejects registration when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...sampleCustomer, confirmPassword: 'differentPassword' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Successfully logs in with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(sampleCustomer);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: sampleCustomer.email,
        password: sampleCustomer.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.fullName).toBe(sampleCustomer.fullName);
  });

  test('POST /api/auth/login - Rejects invalid password', async () => {
    await request(app).post('/api/auth/register').send(sampleCustomer);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: sampleCustomer.email,
        password: 'wrongPassword!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Rejects request missing Bearer token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me - Successfully retrieves profile when token is provided', async () => {
    const regRes = await request(app).post('/api/auth/register').send(sampleCustomer);
    const token = regRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(sampleCustomer.email);
  });
});
