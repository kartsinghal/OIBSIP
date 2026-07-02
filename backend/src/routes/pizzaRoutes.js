import { Router } from 'express';
import { getAllPizzas, getPizzaById, createPizza } from '../controllers/pizzaController.js';
import { validatePizzaCreate } from '../validators/pizzaValidator.js';

const router = Router();

router.get('/', getAllPizzas);
router.get('/:id', getPizzaById);
router.post('/', validatePizzaCreate, createPizza);

export default router;
