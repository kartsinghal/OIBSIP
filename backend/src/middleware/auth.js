import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    const err = new Error('Authentication required');
    err.statusCode = 401;
    throw err;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    const err = new Error('User no longer exists');
    err.statusCode = 401;
    throw err;
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    const err = new Error('You do not have permission to perform this action');
    err.statusCode = 403;
    throw err;
  }
  next();
};
