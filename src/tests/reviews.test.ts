import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';

jest.setTimeout(20000);

let token = '';
let hotelId = '';
let reviewId = '';

const testUser = {
  username: 'reviewTestUser_' + Date.now(),
  email: `review${Date.now()}@test.com`,
  password: 'test1234',
  role: 'user', // ✅ 改為 user
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);

  // 註冊 test user
  await request(app).post('/auth/register').send(testUser);


  // 登入並取得 JWT token
  const res = await request(app).post('/auth/login').send({
    username: testUser.username,
    password: testUser.password,
  });
  expect(res.statusCode).toBe(200);
  token = res.body.token;
  console.log('✅ Logged in. Token:', token);

  // 建立測試用飯店
  const hotelRes = await request(app)
    .post('/hotels')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Review Hotel',
      location: 'Test City',
      stars: 3,
      pricePerNight: 1000 
    });

   

  expect(hotelRes.statusCode).toBe(201);
  hotelId = hotelRes.body.hotel._id;
  console.log('✅ Hotel created with ID:', hotelId);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Review API', () => {
  it('should create a new review', async () => {
    const res = await request(app)
      .post('/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hotelId,
        rating: 4,
        comment: 'Nice hotel for testing.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.review).toHaveProperty('_id');
    reviewId = res.body.review._id;
  });

  it('should fetch my reviews', async () => {
    const res = await request(app)
      .get('/reviews/me/reviews')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body.reviews.length).toBeGreaterThan(0);
  });

  it('should update a review', async () => {
    const res = await request(app)
      .put(`/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ comment: 'Updated comment content.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.review.comment).toContain('Updated');
  });

  it('should delete the review', async () => {
    const res = await request(app)
      .delete(`/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});
