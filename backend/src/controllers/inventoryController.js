import Inventory from '../models/Inventory.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendLowStockAlert } from '../services/mailService.js';

/**
 * GET /api/inventory
 * Returns all inventory items.
 */
export const getAllInventoryItems = asyncHandler(async (req, res) => {
  const items = await Inventory.find({}).sort({ ingredientName: 1 });

  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

/**
 * GET /api/inventory/:id
 * Returns a single inventory item by ID.
 */
export const getInventoryItemById = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    const err = new Error('Inventory item not found');
    err.statusCode = 404;
    throw err;
  }

  res.status(200).json({
    success: true,
    data: item,
  });
});

/**
 * POST /api/inventory
 * Admin: Creates a new inventory item.
 */
export const createInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Inventory item created successfully',
    data: item,
  });
});

/**
 * PATCH /api/inventory/:id
 * Admin: Update stock.
 * Body: { operation: 'set'|'increase'|'decrease', value: Number, threshold?: Number }
 */
export const updateInventoryItem = asyncHandler(async (req, res) => {
  const { operation, value, threshold } = req.body;

  if (!['set', 'increase', 'decrease'].includes(operation)) {
    const err = new Error("operation must be 'set', 'increase', or 'decrease'");
    err.statusCode = 400;
    throw err;
  }
  if (typeof value !== 'number' || value < 0) {
    const err = new Error('value must be a non-negative number');
    err.statusCode = 400;
    throw err;
  }

  const item = await Inventory.findById(req.params.id);
  if (!item) {
    const err = new Error('Inventory item not found');
    err.statusCode = 404;
    throw err;
  }

  if (operation === 'set') {
    item.quantity = value;
  } else if (operation === 'increase') {
    item.quantity += value;
  } else {
    item.quantity = Math.max(0, item.quantity - value);
  }

  // Allow threshold update in same request
  if (typeof threshold === 'number' && threshold >= 0) {
    item.threshold = threshold;
  }

  await item.save();

  // Send low-stock email if item is now at or below threshold
  if (item.quantity <= item.threshold) {
    sendLowStockAlert([item]).catch(() => {});
  }

  res.status(200).json({ success: true, message: 'Stock updated', data: item });
});

/**
 * DELETE /api/inventory/:id
 * Admin: Deletes an inventory item.
 */
export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    const err = new Error('Inventory item not found');
    err.statusCode = 404;
    throw err;
  }

  await item.deleteOne();

  res.status(200).json({
    success: true,
    message: `"${item.ingredientName}" deleted from inventory`,
  });
});
