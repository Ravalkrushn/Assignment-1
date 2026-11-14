import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';

setupTestDB();

describe('Product Management API Tests', () => {
  let adminToken;
  let customerToken;

  beforeEach(async () => {
    // Create admin user
    const admin = await User.create({
      fullName: 'Factory Owner Admin',
      email: 'admin@factory.io',
      phone: '+91 98000 11111',
      password: 'password123',
      role: 'admin'
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@factory.io',
      password: 'password123'
    });
    adminToken = adminLogin.body.data.accessToken;

    // Create customer user
    const custLogin = await request(app).post('/api/auth/register').send({
      fullName: 'Customer User',
      email: 'customer@workshop.in',
      phone: '+91 98000 22222',
      password: 'password123',
      confirmPassword: 'password123'
    });
    customerToken = custLogin.body.data.accessToken;
  });

  const sampleProduct = {
    productName: 'High-Performance Bearing Box',
    sku: 'SKU-BRG-100',
    category: 'Mechanical',
    pointsPerBox: 100,
    price: 1500,
    description: 'Bearing box description'
  };

  test('POST /api/products - Admin can create a new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleProduct);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.sku).toBe('SKU-BRG-100');
  });

  test('POST /api/products - Rejects duplicate SKU', async () => {
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleProduct);

    const dupRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleProduct);

    expect(dupRes.status).toBe(409);
  });

  test('POST /api/products - Customer is forbidden from creating products', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(sampleProduct);

    expect(res.status).toBe(403);
  });

  test('GET /api/products - Public listing returns active products', async () => {
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleProduct);

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBe(1);
  });
});
