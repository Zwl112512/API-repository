import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';


jest.setTimeout(15000); // 延長 timeout

let hotelId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Hotel API', () => {
  it('should get a list of hotels', async () => {
    const res = await request(app).get('/hotels');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.hotels)).toBe(true);
    expect(res.body.hotels.length).toBeGreaterThan(0);
    hotelId = res.body.hotels[0]._id; // 用第一筆資料做單筆查詢
  });

  it('should search hotels by keyword', async () => {
    const res = await request(app).get('/hotels').query({ search: 'Hotel' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.hotels)).toBe(true);
  });

  it('should get a single hotel by ID', async () => {
    const res = await request(app).get(`/hotels/${hotelId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('_id', hotelId);
  });

  it('should return 404 for invalid hotel ID', async () => {
    const res = await request(app).get('/hotels/000000000000000000000000');
    expect(res.statusCode).toBe(404);
  });
});
