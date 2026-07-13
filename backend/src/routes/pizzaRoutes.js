import { Router } from 'express';
import {
  getAllPizzas,
  getPizzaById,
  createPizza,
  getCustomizationOptions,
} from '../controllers/pizzaController.js';
import { validatePizzaCreate } from '../validators/pizzaValidator.js';

const router = Router();

router.get('/', getAllPizzas);
router.get('/customization-options', getCustomizationOptions);
router.get('/:id', getPizzaById);
router.post('/', validatePizzaCreate, createPizza);

export default router;
