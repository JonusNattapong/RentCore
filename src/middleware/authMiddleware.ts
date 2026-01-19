import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (permissions: string[]) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    // In a real system, you'd fetch user permissions from database/cache
    // For now, let's assume 'role_id' is enough or implement a simple check
    console.log('Checking permissions:', permissions);
    return next();
  };
};
