import { Request, Response } from 'express';
import { RoomService } from '../services/roomService';

const roomService = new RoomService();

export const getRooms = async (req: Request, res: Response) => {
  try {
    const branchId = req.query.branchId as string;
    const rooms = await roomService.getAllRooms(branchId);
    return res.json(rooms);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    return res.json(room);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const room = await roomService.createRoom(req.body);
    return res.status(201).json(room);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    return res.json(room);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
