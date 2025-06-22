import { Request, Response } from 'express';
import Hotel from '../models/Hotel';
import Review from '../models/Review';

export const getHotels = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const search = (req.query.search as string) || '';
    const type = req.query.type as string;
    const minStars = parseInt(req.query.minStars as string);
    const location = req.query.location as string;

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

if (location) {
  query.location = location;
}

    if (!isNaN(minStars)) {
      query.starRating = minStars;
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


// ✅ 新增飯店
export const createHotel = async (req: Request, res: Response) => {
  try {
    const {
      name,
      location,
      pricePerNight,
      amenities,
      type,
      starRating,
    } = req.body;

    const hotel = new Hotel({
      name,
      location,
      pricePerNight,
      amenities,
      type,
      starRating,
      imageUrl: req.file ? `/uploads/hotelImages/${req.file.filename}` : undefined,
    });

    await hotel.save();
    res.status(201).json({ message: 'Hotel created', hotel });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create hotel', error });
  }
};

// ✅ 熱門飯店（依照評論平均分數與數量排序）
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

// ✅ 查詢單一飯店
export const getHotelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }
    res.json(hotel);
  } catch (err) {
    console.error('Get hotel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ 更新飯店資訊
export const updateHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      location,
      pricePerNight,
      starRating,
    } = req.body;

    const updateData: any = {
      name,
      location,
      pricePerNight,
      starRating,
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/hotelImages/${req.file.filename}`;
    }

    const hotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!hotel) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }

    res.json({ message: 'Hotel updated', hotel });
  } catch (err) {
    console.error('Update hotel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ 刪除飯店
export const deleteHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }
    res.json({ message: 'Hotel deleted' });
  } catch (err) {
    console.error('Delete hotel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
