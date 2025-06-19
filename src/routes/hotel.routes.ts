// src/routes/hotel.routes.ts
import express from 'express';
import { createHotel, getHotels, getPopularHotels } from '../controllers/hotel.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/', verifyToken, createHotel);
router.get('/', getHotels);


router.get('/popular', getPopularHotels);

export default router;
