import { Router } from "express";
import * as animalController from "../controllers/animalController";

const router = Router();

// Availability endpoint
router.get("/availability", animalController.getAvailability);

// CRUD
router.get("/", animalController.getAnimals);
router.get("/:id", animalController.getAnimalById);
router.post("/", animalController.createAnimal);
router.patch("/:id", animalController.updateAnimal);
router.delete("/:id", animalController.deleteAnimal);

export default router;
