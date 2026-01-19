import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await authService.authenticate(username, password);
    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  // Assuming authMiddleware has already added user to req
  return res.json((req as any).user);
};
