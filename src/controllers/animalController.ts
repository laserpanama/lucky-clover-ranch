import { Request, Response, NextFunction } from 'express';
import * as animalService from '../services/animalService';
import { z } from 'zod';

const animalSchema = z.object({
  tagNumber: z.string().min(1),
  name: z.string().min(1),
  breed: z.string().min(1),
  status: z.string().min(1),
  category: z.string().optional(),
  dateOfBirth: z.string().transform((val) => new Date(val)),
  notes: z.string().optional(),
});

export const getAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animals = await animalService.getAnimalsWithAvailability();
    res.json(animals);
  } catch (error) {
    next(error);
  }
};

export const getAnimals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animals = await animalService.getAllAnimals();
    res.json(animals);
  } catch (error) {
    next(error);
  }
};

export const getAnimalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animal = await animalService.getAnimalById(Number(req.params.id));
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    res.json(animal);
  } catch (error) {
    next(error);
  }
};

export const createAnimal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = animalSchema.parse(req.body);
    const animal = await animalService.createAnimal(data);
    res.status(201).json(animal);
  } catch (error) {
    next(error);
  }
};

export const updateAnimal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = animalSchema.partial().parse(req.body);
    const animal = await animalService.updateAnimal(Number(req.params.id), data);
    res.json(animal);
  } catch (error) {
    next(error);
  }
};

export const deleteAnimal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await animalService.deleteAnimal(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
