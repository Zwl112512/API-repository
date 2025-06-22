// src/tests/bookings.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';

jest.setTimeout(20000);

let token: string;
let hotelId: string;
let bookingId: string;

const testUser = {
  username: `bookingTestUser_${Date.now()}`,
  email: `booking${Date.now()}@example.com`,
  password: 'testpass123',
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);

  // 註冊並登入
  await request(app).post('/auth/register').send(testUser);
  console.log('✅ Registered new test user');

  const res = await request(app).post('/auth/login').send({
    username: testUser.username,
    password: testUser.password,
  });

  token = res.body.token;
  console.log('✅ Logged in. Token:', token.slice(0, 20) + '...');

  // 建立飯店
  const hotelRes = await request(app)
    .post('/hotels')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Booking Test Hotel',
      location: 'Test City',
      description: 'Test desc',
      pricePerNight: 100,
      amenities: ['WiFi'],
      type: 'resort',
      starRating: 5,
    });

  if (!hotelRes.body.hotel?._id) {
    throw new Error('❌ Failed to create hotel');
  }

  hotelId = hotelRes.body.hotel._id;
  console.log('✅ Hotel created with ID:', hotelId);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Booking API', () => {
  it('should create a new booking', async () => {
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
hotel: hotelId,  
  checkIn: '2025-07-01',
  checkOut: '2025-07-05',
        guests: 2,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.booking).toHaveProperty('_id');
    bookingId = res.body.booking._id;
  });

  it('should fetch my bookings', async () => {
    const res = await request(app)
      .get('/bookings/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.bookings.length).toBeGreaterThan(0);
  });

  it('should delete my booking', async () => {
    const res = await request(app)
      .delete(`/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});
