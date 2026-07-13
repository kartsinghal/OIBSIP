import mongoose from 'mongoose';

/**
 * Temporary OTP store. TTL index auto-deletes documents after `expiresAt`.
 * No cron job needed — MongoDB handles cleanup natively.
 */
const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL: remove when expiresAt is reached
  },
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
