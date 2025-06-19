// src/routes/admin.routes.ts
import express from 'express';
import { verifyToken } from '../middleware/auth';
import User from '../models/User';
import Hotel from '../models/Hotel';
import Booking from '../models/Booking';
import { getAllReviewsForAdmin, getReviewStats } from '../controllers/review.controller';

const router = express.Router();

// 中间件：必须为管理员
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET 所有订单（原有）
router.get('/bookings', verifyToken, requireAdmin, async (req, res) => {
  const bookings = await Booking.find().populate('hotel').populate('user');
  res.json({ bookings });
});

// ✅ GET 所有酒店
router.get('/hotels', verifyToken, requireAdmin, async (req, res) => {
  const hotels = await Hotel.find();
  res.json({ hotels });
});

// ✅ GET 指定酒店的订单
router.get('/hotels/:id/bookings', verifyToken, requireAdmin, async (req, res) => {
  const bookings = await Booking.find({ hotel: req.params.id }).populate('user');
  res.json({ bookings });
});

// ✅ DELETE 删除某个酒店（附带订单一并删除）
router.delete('/hotels/:id', verifyToken, requireAdmin, async (req, res) => {
  await Booking.deleteMany({ hotel: req.params.id });
  const deletedHotel = await Hotel.findByIdAndDelete(req.params.id);
  if (!deletedHotel) {
     res.status(404).json({ message: 'Hotel not found' });
  }
  res.json({ message: 'Hotel and related bookings deleted' });
});

router.get('/reviews', verifyToken, requireAdmin, getAllReviewsForAdmin, getReviewStats);


export default router;
