import { Router } from 'express';
import { signup, login, me, sendOtp, verifyOtp, googleAuth, updateProfile } from '../controllers/authController.js';
import { validateSignup, validateLogin } from '../validators/authValidator.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Email / password
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

// Mobile OTP
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Google
router.post('/google', googleAuth);

// Protected
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);

export default router;

