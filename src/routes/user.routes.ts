import express from 'express';
import { getMe, updateMe } from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// 查看自己的資料
router.get('/me', verifyToken, getMe);

// 修改自己的資料
router.put('/me', verifyToken, updateMe);

export default router;
