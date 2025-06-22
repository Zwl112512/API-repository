// src/controllers/booking.controller.ts
import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Hotel from '../models/Hotel';

// ✅ 创建新的预订
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { hotelId, checkIn, checkOut, guests } = req.body;

    if (!hotelId || !checkIn || !checkOut || !guests) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const booking = await Booking.create({
      user: userId,
      hotel: hotelId,
      checkIn,
      checkOut,
      guests,
    });

    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ 获取当前用户的所有预订
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const bookings = await Booking.find({ user: userId }).populate('hotel');
    res.json({ bookings });
  } catch (err) {
    console.error('Get my bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ 获取某饭店所有预订（仅自己发起）
export const getBookingsByHotel = async (req: Request, res: Response) => {
  try {
    const hotelId = req.params.hotelId;
    const bookings = await Booking.find({ hotel: hotelId })
      .populate('user')
      .populate('hotel');
    res.json({ bookings });
  } catch (err) {
    console.error('Get bookings by hotel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ 删除预订（只能删除自己的）
export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    if (booking.user.toString() !== userId) {
      res.status(403).json({ message: 'Unauthorized to delete this booking' });
      return;
    }

    await Booking.findByIdAndDelete(bookingId);
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

