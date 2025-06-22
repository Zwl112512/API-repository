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
router.get('/reviews', verifyToken, requireAdmin, getAllReviewsForAdmin);
router.get('/reviews/stats', verifyToken, requireAdmin, getReviewStats);



// ✅ PUT 更新單筆訂單（修改入住日期、旅客數）
router.put('/bookings/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        checkIn: req.body.checkIn,
        checkOut: req.body.checkOut,
        guests: req.body.guests,
      },
      { new: true }
    ).populate('user hotel');

    if (!booking) {
       res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking updated', booking });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ DELETE 刪除單筆訂單
router.delete('/bookings/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
       res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ GET 所有使用者（用於管理者查看 user 列表）
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // 不傳回密碼
    res.json({ users });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



export default router;