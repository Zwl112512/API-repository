import { Request, Response } from 'express';
import Review from '../models/Review';
import Hotel from '../models/Hotel';

// 發表評論
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { hotelId, rating, comment } = req.body;

    if (!hotelId || !rating || !comment) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }

    

    const review = await Review.create({
      hotel: hotelId,
      user: userId,
      rating,
      comment,
    });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 取得某個飯店的所有評論
export const getReviewsByHotel = async (req: Request, res: Response) => {
  try {
    const hotelId = req.params.hotelId;
    const reviews = await Review.find({ hotel: hotelId })
      .populate('user', 'username') // 拿到 user._id + username
      .sort({ createdAt: -1 });

const formatted = reviews.map((r) => {
  const user = r.user;
  const userId = typeof user === 'object' && '_id' in user ? user._id.toString() : '';
  const username = typeof user === 'object' && 'username' in user ? user.username : '匿名';

  return {
    _id: r._id,
    userId,
    username,
    comment: r.comment,
    rating: r.rating,
  };
});


    res.json({ reviews: formatted });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { hotelId, rating, comment } = req.body;

    if (user.role === 'admin') {
      res.status(403).json({ message: 'Admins are not allowed to submit reviews.' });
      return;
    }

    if (!hotelId || !rating || !comment) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }

    const existing = await Review.findOne({ user: user.id, hotel: hotelId });
    if (existing) {
      res.status(400).json({ message: 'You have already reviewed this hotel.' });
      return;
    }

    const review = await Review.create({
      user: user.id,
      hotel: hotelId,
      rating,
      comment,
    });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



// 管理員查看所有評論（支援搜尋參數）
export const getAllReviewsForAdmin = async (req: Request, res: Response) => {
  try {
    const { hotelId, userId, minRating, maxRating } = req.query;

    const filter: any = {};
    if (hotelId) filter.hotel = hotelId;
    if (userId) filter.user = userId;
    if (minRating) filter.rating = { ...filter.rating, $gte: Number(minRating) };
    if (maxRating) filter.rating = { ...filter.rating, $lte: Number(maxRating) };

    const reviews = await Review.find(filter)
      .populate('hotel', 'name')
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json({ total: reviews.length, reviews });
  } catch (err) {
    console.error('Admin get reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewId = req.params.id;
    const userId = (req as any).user.id;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (review.user.toString() !== userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    await updateHotelAverageRating(review.hotel.toString());
    res.json({ message: 'Review updated', review });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewId = req.params.id;
    const userId = (req as any).user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (review.user.toString() !== userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    await review.deleteOne();
    await updateHotelAverageRating(review.hotel.toString());
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



const updateHotelAverageRating = async (hotelId: string): Promise<void> => {
  const reviews = await Review.find({ hotel: hotelId });
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  await Hotel.findByIdAndUpdate(hotelId, { averageRating: avgRating });
};



export const getMyReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const reviews = await Review.find({ user: userId }).populate('hotel', 'name');

    const formatted = reviews.map((r) => ({
      _id: r._id,
      hotelId: typeof r.hotel === 'object' && '_id' in r.hotel ? r.hotel._id.toString() : '',
      hotelName: typeof r.hotel === 'object' && 'name' in r.hotel ? r.hotel.name : '未知飯店',
      comment: r.comment,
      rating: r.rating,
    }));

    res.json({ reviews: formatted });
  } catch (err) {
    console.error('Get my reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};




export const getReviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$hotel',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      { $unwind: '$hotel' },
      {
        $project: {
          _id: 0,
          hotelId: '$hotel._id',
          hotelName: '$hotel.name',
          count: 1,
          avgRating: { $round: ['$avgRating', 2] }
        }
      }
    ]);

    res.json({ stats });
  } catch (err) {
    console.error('Get review stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
