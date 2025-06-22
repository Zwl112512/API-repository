// src/routes/user.routes.ts
import express from 'express';
import {
  getMe,
  updateMe,
  register,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);
router.post('/register', register);
router.get('/', verifyToken, isAdmin, getAllUsers);
router.put('/:id', verifyToken, isAdmin, updateUser);   // ✅ 新增
router.delete('/:id', verifyToken, isAdmin, deleteUser); // ✅ 新增

export default router;
