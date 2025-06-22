// src/tests/admin.test.ts

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';
import bcrypt from 'bcryptjs';

jest.setTimeout(30000);

const adminUser = {
  username: 'adminTestUser',
  email: 'admin@example.com',
  password: 'adminpass123',
  role: 'admin',
};

const normalUser = {
  username: 'testuser1',
  email: 'user1@example.com',
  password: 'testpass1',
};

let adminToken = '';
let userToken = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);

  // Admin user setup
  const existingAdmin = await User.findOne({ username: adminUser.username });
  if (!existingAdmin) {
    await request(app).post('/auth/register').send(adminUser);
    console.log('✅ Admin user registered');
  } else {
    existingAdmin.password = await bcrypt.hash(adminUser.password, 10);
    existingAdmin.role = 'admin';
    await existingAdmin.save();
    console.log('🔁 Admin user password reset');
  }

  // Normal user setup
  const existingUser = await User.findOne({ username: normalUser.username });
  if (!existingUser) {
    await request(app).post('/auth/register').send(normalUser);
    console.log('✅ Normal user registered');
  } else {
    existingUser.password = await bcrypt.hash(normalUser.password, 10);
    existingUser.role = 'user';
    await existingUser.save();
    console.log('🔁 Normal user password reset');
  }

  // Login admin
  const adminRes = await request(app).post('/auth/login').send({
    username: adminUser.username,
    password: adminUser.password,
  });
  expect(adminRes.statusCode).toBe(200);
  expect(adminRes.body).toHaveProperty('token');
  adminToken = adminRes.body.token;

  // Login normal user
  const userRes = await request(app).post('/auth/login').send({
    username: normalUser.username,
    password: normalUser.password,
  });
  expect(userRes.statusCode).toBe(200);
  expect(userRes.body).toHaveProperty('token');
  userToken = userRes.body.token;
});


afterAll(async () => {
  await mongoose.connection.close();
});

describe('✅ Admin API Permissions', () => {
  it('admin can access /admin/reviews', async () => {
    const res = await request(app)
      .get('/admin/reviews')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.reviews)).toBe(true);
  });

  it('user cannot access /admin/reviews', async () => {
    const res = await request(app)
      .get('/admin/reviews')
      .set('Authorization', `Bearer ${userToken}`);
    expect([401, 403]).toContain(res.statusCode);
  });

  it('admin can access /admin/hotels', async () => {
    const res = await request(app)
      .get('/admin/hotels')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.hotels)).toBe(true);
  });

  it('user cannot access /admin/hotels', async () => {
    const res = await request(app)
      .get('/admin/hotels')
      .set('Authorization', `Bearer ${userToken}`);
    expect([401, 403]).toContain(res.statusCode);
  });
});
