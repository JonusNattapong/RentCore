import { Request, Response } from 'express';
import { DailyStayService } from '../services/dailyStayService';

const dailyStayService = new DailyStayService();

export const getAvailableRooms = async (req: Request, res: Response) => {
  try {
    const { branchId, checkIn, checkOut } = req.query;
    if (!branchId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'branchId, checkIn, and checkOut are required' });
    }
    const rooms = await dailyStayService.getAvailableRooms(
      branchId as string,
      new Date(checkIn as string),
      new Date(checkOut as string)
    );
    return res.json(rooms);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const bookStay = async (req: Request, res: Response) => {
  try {
    const stay = await dailyStayService.bookStay(req.body);
    return res.status(201).json(stay);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const checkIn = async (req: Request, res: Response) => {
  try {
    const stay = await dailyStayService.checkIn(req.params.id);
    if (!stay) return res.status(404).json({ error: 'Stay not found' });
    return res.json(stay);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  try {
    const stay = await dailyStayService.checkOut(req.params.id);
    if (!stay) return res.status(404).json({ error: 'Stay not found' });
    return res.json(stay);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
