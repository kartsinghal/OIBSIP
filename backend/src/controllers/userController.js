import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/users
 * Returns all registered users.
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

/**
 * GET /api/users/:id
 * Returns a user by ID.
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * POST /api/users
 * Creates a new user (admin-facing). Passwords are hashed before storage.
 */
export const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (await User.findOne({ email })) {
    const err = new Error('A user with this email address already exists');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ fullName, email, password: hashed, role: role || 'customer' });

  const { password: _, ...userResponse } = user.toObject();

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: userResponse,
  });
});
