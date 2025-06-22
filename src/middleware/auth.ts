// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';



export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  console.log('👉 Authorization Header:', authHeader); // ✅ 加这一行检查是否带入 token

  if (!authHeader?.startsWith('Bearer ')) {
    console.log('❌ Missing or malformed token');
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  console.log('✅ JWT_SECRET:', process.env.JWT_SECRET);


  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('✅ JWT payload:', payload); // ✅ 加这一行查看解析出来的 user
    (req as any).user = payload;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err); // ✅ 捕获具体错误
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}
