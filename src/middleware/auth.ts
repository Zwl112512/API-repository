// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });  // ✅ 不要 return
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = payload;
    next();  // ✅ 正确
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });  // ✅ 不要 return
  }
}


export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
     res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
};