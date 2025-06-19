import express from 'express';
import { verifyToken } from '../middleware/auth';
import { toggleFavorite, getFavorites } from '../controllers/favorite.controller';

const router = express.Router();

// 收藏或取消收藏某間飯店
router.post('/:hotelId', verifyToken, toggleFavorite);

// 取得當前使用者的收藏飯店清單
router.get('/', verifyToken, getFavorites);

export default router;
