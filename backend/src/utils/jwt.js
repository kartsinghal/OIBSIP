import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (payload) => {
  if (!SECRET) throw new Error('JWT_SECRET is not defined in environment');
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token) => {
  if (!SECRET) throw new Error('JWT_SECRET is not defined in environment');
  return jwt.verify(token, SECRET);
};
