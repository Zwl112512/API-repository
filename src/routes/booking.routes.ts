// src/routes/booking.routes.ts
import express from 'express';
import { verifyToken } from '../middleware/auth';
import Booking from '../models/Booking';

const router = express.Router();

// ✅ 查詢指定飯店的所有預約
router.get('/hotel/:hotelId', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ hotel: req.params.hotelId })
      .populate('hotel')
      .populate('user');
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching hotel bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ 查詢自己的所有預約
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const bookings = await Booking.find({ user: userId }).populate('hotel');
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /bookings/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.user.toString() !== userId) {
      res.status(403).json({ message: 'Forbidden: Not your booking' });
      return;
    }

    await Booking.findByIdAndDelete(bookingId);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
