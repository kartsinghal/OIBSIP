import { Router } from 'express';
import { getAllOrders, getMyOrders, getOrderById, createOrder, updateOrderStatus, updatePaymentStatus, trackOrderByPublicId } from '../controllers/orderController.js';
import { validateOrderCreate } from '../validators/orderValidator.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// ── Public route (no auth) — track by public order ID ──────────────────────────
// Must be registered BEFORE router.use(authenticate) so it doesn't require a token
router.get('/track/:publicId', trackOrderByPublicId);

// All routes below require authentication
router.use(authenticate);

// Admin only routes
router.get('/', authorize('admin'), getAllOrders);
router.patch('/:id/status', authorize('admin'), updateOrderStatus);
router.patch('/:id/payment-status', authorize('admin'), updatePaymentStatus);

// User routes
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.post('/', validateOrderCreate, createOrder);

export default router;
