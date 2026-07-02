import { Router } from 'express';
import {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventoryController.js';
import { validateInventoryCreate } from '../validators/inventoryValidator.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All inventory routes require authentication
router.use(authenticate);

// Read: any authenticated user (checkout uses inventory checks)
router.get('/', getAllInventoryItems);
router.get('/:id', getInventoryItemById);

// Write: admin only
router.post('/', authorize('admin'), validateInventoryCreate, createInventoryItem);
router.patch('/:id', authorize('admin'), updateInventoryItem);
router.delete('/:id', authorize('admin'), deleteInventoryItem);

export default router;
