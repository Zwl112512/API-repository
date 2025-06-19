// src/controllers/user.controller.ts

import { Request, Response } from 'express';
import User from '../models/User';

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const updated = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    }).select('-password');

    if (!updated) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User updated', user: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
