import { Request, Response, NextFunction } from 'express';
import * as healthService from '../services/healthService';
import { z } from 'zod';

const healthSchema = z.object({
  animalId: z.number(),
  type: z.string().min(1),
  description: z.string().min(1),
  date: z.string().transform((val) => new Date(val)),
  nextDueDate: z.string().optional().transform((val) => val ? new Date(val) : null),
});

export const getHealthRecordsByAnimal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await healthService.getHealthRecordsByAnimal(Number(req.params.animalId));
    res.json(records);
  } catch (error) {
    next(error);
  }
};

export const createHealthRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = healthSchema.parse(req.body);
    const record = await healthService.createHealthRecord(data);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};
