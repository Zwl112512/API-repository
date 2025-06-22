import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import User from '../models/User';
import Favorite from '../models/Favorite';

// 加入或移除收藏
export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: Types.ObjectId = (req as any).user.id;
    const hotelId = req.params.hotelId;

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      res.status(400).json({ message: 'Invalid hotel ID' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const index = user.favorites.findIndex(favId => favId.equals(hotelId));
    if (index >= 0) {
      user.favorites.splice(index, 1);
      await user.save();
      res.json({ message: 'Removed from favorites' });
    } else {
      user.favorites.push(new mongoose.Types.ObjectId(hotelId));
      await user.save();
      res.json({ message: 'Added to favorites' });
    }
  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 查看收藏列表
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: Types.ObjectId = (req as any).user.id;
    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const checkFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const hotelId = req.params.hotelId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      const isFavorite = user.favorites.some((favId) =>
        favId.equals(hotelId)
      );
      res.json({ isFavorite });
    }
  } catch (err) {
    console.error('Check favorite error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


