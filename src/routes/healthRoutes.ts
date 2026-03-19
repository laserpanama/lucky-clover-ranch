import { Router } from 'express';
import * as healthController from '../controllers/healthController';

const router = Router();

router.get('/animal/:animalId', healthController.getHealthRecordsByAnimal);
router.post('/', healthController.createHealthRecord);

export default router;
