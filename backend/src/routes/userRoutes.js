import { Router } from 'express';
import { getAllUsers, getUserById, createUser } from '../controllers/userController.js';
import { validateUserCreate } from '../validators/userValidator.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', validateUserCreate, createUser);

export default router;
