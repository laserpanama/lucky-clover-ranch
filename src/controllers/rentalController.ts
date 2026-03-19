import { Request, Response, NextFunction } from 'express';
import * as rentalService from '../services/rentalService';
import { z } from 'zod';

const rentalSchema = z.object({
  animalId: z.number(),
  clientId: z.number(),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  price: z.number().positive(),
  contractUrl: z.string().optional(),
  notes: z.string().optional(),
});

const BUSINESS_ERRORS = [
  'Start date must be before end date',
  'Cannot create rentals in the past',
  'Animal is injured and cannot be rented',
  'Animal is already booked for these dates',
  'Animal not found',
];

export const getAllRentals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await rentalService.getAllRentals());
  } catch (error) { next(error); }
};

export const getRentalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rental = await rentalService.getRentalById(Number(req.params.id));
    if (!rental) return res.status(404).json({ error: 'Rental not found' });
    res.json(rental);
  } catch (error) { next(error); }
};

export const createRental = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = rentalSchema.parse(req.body);
    const rental = await rentalService.createRental(data);
    res.status(201).json(rental);
  } catch (error: any) {
    if (BUSINESS_ERRORS.includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const updateRental = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = rentalSchema.partial().parse(req.body);
    res.json(await rentalService.updateRental(Number(req.params.id), data));
  } catch (error) { next(error); }
};
