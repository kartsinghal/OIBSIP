import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';

const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  authProvider: user.authProvider,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

// ─── Email / Password (existing — preserved) ─────────────────────────────────

export const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (await User.findOne({ email })) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ fullName, email, password: hashed, authProvider: 'local', isVerified: true });

  const token = signToken({ id: user._id, role: user.role });

  res.status(201).json({ success: true, message: 'Account created successfully', token, data: safeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  const valid = user && (await bcrypt.compare(password, user.password));

  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ id: user._id, role: user.role });
  res.status(200).json({ success: true, message: 'Login successful', token, data: safeUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: safeUser(req.user) });
});

// ─── Mobile OTP ───────────────────────────────────────────────────────────────

export const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^\+?[1-9]\d{6,14}$/.test(phone)) {
    const err = new Error('Enter a valid phone number');
    err.statusCode = 400;
    throw err;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  // Upsert: replace any existing OTP for this phone
  await Otp.findOneAndUpdate(
    { phone },
    { code, expiresAt },
    { upsert: true, new: true }
  );

  // TODO: replace with Twilio / SMS provider
  console.log(`[OTP] ${phone} → ${code} (expires ${expiresAt.toISOString()})`);

  res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    const err = new Error('Phone and OTP code are required');
    err.statusCode = 400;
    throw err;
  }

  const record = await Otp.findOne({ phone });

  if (!record || record.code !== String(code)) {
    const err = new Error('Invalid or expired OTP');
    err.statusCode = 401;
    throw err;
  }

  // OTP valid — delete it immediately (single-use)
  await record.deleteOne();

  // Find or create user
  let user = await User.findOne({ phone });
  const isNew = !user;

  if (isNew) {
    user = await User.create({ phone, authProvider: 'phone', isVerified: true });
  }

  const token = signToken({ id: user._id, role: user.role });

  res.status(200).json({
    success: true,
    message: isNew ? 'Account created' : 'Login successful',
    token,
    isNewUser: isNew,
    data: safeUser(user),
  });
});

// ─── Google Auth ──────────────────────────────────────────────────────────────

export const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, avatar } = req.body;

  if (!email) {
    const err = new Error('Google account email is required');
    err.statusCode = 400;
    throw err;
  }

  let user = await User.findOne({ email });
  const isNew = !user;

  if (isNew) {
    user = await User.create({
      email,
      fullName: name || null,
      avatar: avatar || null,
      authProvider: 'google',
      isVerified: true,
    });
  } else if (user.authProvider !== 'google') {
    // Account exists via different provider — still allow sign-in, don't overwrite provider
    // (optional: you could enforce single-provider policy here)
  }

  const token = signToken({ id: user._id, role: user.role });

  res.status(200).json({
    success: true,
    message: isNew ? 'Account created' : 'Login successful',
    token,
    isNewUser: isNew,
    data: safeUser(user),
  });
});

// ─── Update Profile ────────────────────────────────────────────────────────────

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  const user = req.user;

  if (fullName !== undefined) {
    user.fullName = fullName;
  }

  if (email !== undefined) {
    if (email && email.trim() !== '') {
      const emailLower = email.toLowerCase();
      // Check for duplication
      const existing = await User.findOne({ email: emailLower, _id: { $ne: user._id } });
      if (existing) {
        const err = new Error('An account with this email already exists');
        err.statusCode = 409;
        throw err;
      }
      user.email = emailLower;
    } else {
      user.email = null;
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: safeUser(user),
  });
});

