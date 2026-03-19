import { Request, Response, NextFunction } from 'express';
import * as clientService from '../services/clientService';
import { z } from 'zod';

const clientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  organization: z.string().optional(),
  notes: z.string().optional(),
});

export const getAllClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await clientService.getAllClients();
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await clientService.getClientById(Number(req.params.id));
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = clientSchema.parse(req.body);
    const client = await clientService.createClient(data);
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = clientSchema.partial().parse(req.body);
    const client = await clientService.updateClient(Number(req.params.id), data);
    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clientService.deleteClient(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
