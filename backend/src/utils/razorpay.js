import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Initializes the Razorpay instance with environment variables.
 * Fails gracefully if not configured to prevent app crash on startup.
 */
export const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    console.warn('⚠️ Razorpay credentials not found in environment.');
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });
};

/**
 * Validates Razorpay signature securely on the server.
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) throw new Error('Razorpay secret not configured.');

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};
