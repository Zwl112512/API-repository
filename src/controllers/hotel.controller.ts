import { Request, Response } from 'express';
import Hotel from '../models/Hotel';
import Review from '../models/Review';

// GET /hotels?page=1&limit=10&search=grand&type=resort&minStars=4
export const getHotels = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const type = req.query.type as string;
    const minStars = parseInt(req.query.minStars as string);

    const query: any = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }

    if (type) {
      query.type = type;
    }

    if (!isNaN(minStars)) {
      query.starRating = { $gte: minStars };
    }

    const totalItems = await Hotel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const hotels = await Hotel.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ currentPage: page, totalPages, totalItems, hotels });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
export const createHotel = async (req: Request, res: Response) => {
  try {
    const {
      name,
      location,
      pricePerNight,
      amenities,
      type,
      starRating,
      imageUrl // ✅ 新增欄位支援
    } = req.body;

    const hotel = new Hotel({
      name,
      location,
      pricePerNight,
      amenities,
      type,
      starRating,
      imageUrl // ✅ 設定圖片
    });

    await hotel.save();

    res.status(201).json({ message: 'Hotel created', hotel });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create hotel', error });
  }
};

export const getPopularHotels = async (req: Request, res: Response) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$hotel',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel',
        },
      },
      { $unwind: '$hotel' },
      {
        $project: {
          _id: 0,
          hotelId: '$hotel._id',
          name: '$hotel.name',
          location: '$hotel.location',
          type: '$hotel.type',
          starRating: '$hotel.starRating',
          imageUrl: '$hotel.imageUrl',
          avgRating: { $round: ['$avgRating', 2] },
          reviewCount: 1,
        },
      },
      { $sort: { avgRating: -1, reviewCount: -1 } },
    ]);

    res.json({ total: stats.length, hotels: stats });
  } catch (err) {
    console.error('Get popular hotels error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
