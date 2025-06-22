// tests/auth.test.ts

import request from 'supertest';
import mongoose from 'mongoose';
import app from '..//app';
import User from '../models/User';
jest.setTimeout(15000);
const testUser = {
  username: 'testuser12',
  email: 'testuser1@example.com',
  password: 'testpass123',
};

let token = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
   await User.deleteOne({ username: testUser.username });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should log in with correct credentials', async () => {
    const res = await request(app).post('/auth/login').send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/auth/login').send({
      username: testUser.username,
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });

  it('should return profile info with valid token', async () => {
    const res = await request(app)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.username).toBe(testUser.username);
  });
});
