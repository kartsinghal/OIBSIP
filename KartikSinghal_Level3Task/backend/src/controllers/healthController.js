import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/health
 * Returns server status, uptime, environment, and DB connection state.
 */
export const healthCheck = asyncHandler(async (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.status(200).json({
    success: true,
    message: 'InfernoPizza API is running',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: dbState[mongoose.connection.readyState] || 'unknown',
    },
  });
});
