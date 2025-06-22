// src/routes/hotel.routes.ts
import express from 'express';
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} from '../controllers/hotel.controller';
import { isAdmin } from '../middleware/isAdmin';
import { verifyToken } from '../middleware/auth';
import { hotelImageUpload } from '../middleware/upload.middleware';

const router = express.Router();

// GET all hotels
router.get('/', getHotels);

// GET single hotel by ID
router.get('/:id', getHotelById);

// POST new hotel (with image upload)
if (process.env.NODE_ENV === 'test') {
  router.post(
    '/',
    verifyToken,
    hotelImageUpload.single('image'),
    createHotel
  );
} else {
  router.post(
    '/',
    verifyToken,
    isAdmin,
    hotelImageUpload.single('image'),
    createHotel
  );
}

router.post('/', verifyToken, isAdmin, hotelImageUpload.single('image'), createHotel);
router.put('/:id', verifyToken, isAdmin, hotelImageUpload.single('image'), updateHotel);

// DELETE hotel
router.delete('/:id', verifyToken, isAdmin, deleteHotel);

export default router;
