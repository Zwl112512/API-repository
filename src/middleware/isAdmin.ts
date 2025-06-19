// src/middleware/isAdmin.ts
import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admins only' });
  }
};
