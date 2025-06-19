import express from 'express';
import { createReview, getReviewsByHotel, submitReview, updateReview, deleteReview, getMyReviews} from '../controllers/review.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// 提交評論（需要登入）
router.post('/', verifyToken, submitReview);

// 查詢特定飯店的所有評論（公開）
router.get('/:hotelId', getReviewsByHotel);

router.put('/:id', verifyToken, updateReview);   // 修改评论
router.delete('/:id', verifyToken, deleteReview); // 删除评论

router.get('/me/reviews', verifyToken, getMyReviews);

export default router;
