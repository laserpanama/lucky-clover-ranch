import { Router } from 'express';
import * as rentalController from '../controllers/rentalController.ts';

const router = Router();

router.get('/', rentalController.getAllRentals);
router.get('/:id', rentalController.getRentalById);
router.post('/', rentalController.createRental);
router.put('/:id', rentalController.updateRental);
router.delete('/:id', rentalController.deleteRental);

export default router;
