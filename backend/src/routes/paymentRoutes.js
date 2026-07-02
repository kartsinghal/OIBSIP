import { Router } from 'express';
import { createPaymentOrder, verifyPayment, confirmCOD } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Secure payment routes behind authentication
router.use(authenticate);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/confirm-cod', confirmCOD);

export default router;
