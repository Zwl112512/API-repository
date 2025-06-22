// src/controllers/auth.controller.ts
import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password, role } = req.body; // ✅ 接收 role

    if (!username || !email || !password) {
      res.status(400).json({ message: '所有欄位為必填' });
      return;
    }

    const exists = await User.findOne({ username });
    if (exists) {
      res.status(409).json({ message: '用戶名已存在' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashed,
      role: role || 'user', // ✅ 記得用傳入或預設 'user'
    });

    // ✅ 修正：token 內需包含 role
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ message: '註冊成功', token, user: newUser });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: '註冊失敗' });
  }
};


// ✅ 登入
export const login: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: '帳戶不存在' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: '密碼錯誤' });
      return;
    }

const token = jwt.sign(
  { id: user._id, username: user.username, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' }
);
    res.json({ message: '登入成功', token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: '登入失敗' });
  }
};
