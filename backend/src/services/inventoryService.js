import Inventory from '../models/Inventory.js';
import { sendLowStockAlert } from '../services/mailService.js';

/**
 * Base ingredients consumed by EVERY pizza, regardless of toppings.
 * Keys must match `ingredientName` (case-insensitive) in the Inventory collection.
 * Quantities are per-pizza-unit (multiplied by item.quantity at deduction time).
 *
 * Size multipliers:
 *   small  → 1×
 *   medium → 1.5×
 *   large  → 2×
 */
const BASE_INGREDIENTS = ['dough', 'sauce', 'cheese'];

const SIZE_MULTIPLIER = {
  small: 1,
  medium: 1.5,
  large: 2,
};

/**
 * Build a flat requirement map { ingredientNameLower: totalQty } for an
 * array of order/cart items.
 *
 * Each item contributes:
 *   - base ingredients (dough, sauce, cheese) × size multiplier × quantity
 *   - extra cheese (if extraCheese=true) × size multiplier × quantity
 *   - each topping × quantity
 */
export const buildRequirements = (items) => {
  const req = {};

  const add = (name, qty) => {
    const key = name.toLowerCase();
    req[key] = (req[key] || 0) + qty;
  };

  for (const item of items) {
    const mult = SIZE_MULTIPLIER[item.size] || 1;
    const qty  = item.quantity || 1;

    // Base ingredients
    for (const ing of BASE_INGREDIENTS) {
      add(ing, mult * qty);
    }

    // Extra cheese
    if (item.extraCheese) {
      add('cheese', mult * qty);
    }

    // Toppings
    for (const topping of item.toppings || []) {
      add(topping, qty);
    }
  }

  return req;
};

/**
 * Check if inventory is sufficient for the given requirements.
 * Throws HTTP 409 if any ingredient is out of stock.
 * @param {Object} requirements - { ingredientNameLower: qty }
 * @param {mongoose.ClientSession} [session]
 */
export const checkInventory = async (requirements, session) => {
  const names = Object.keys(requirements);
  if (names.length === 0) return;

  const query = Inventory.find({ ingredientName: { $in: names } });
  if (session) query.session(session);
  const records = await query;

  const invMap = Object.fromEntries(
    records.map(r => [r.ingredientName.toLowerCase(), r])
  );

  const outOfStock = [];
  for (const name of names) {
    const record = invMap[name];
    if (record && record.quantity < requirements[name]) {
      outOfStock.push(record.ingredientName);
    }
    // If ingredient doesn't exist in inventory yet, we skip (non-blocking)
  }

  if (outOfStock.length > 0) {
    const err = new Error(`Out of stock: ${outOfStock.join(', ')}`);
    err.statusCode = 409;
    throw err;
  }
};

/**
 * Deduct inventory for confirmed order items.
 * Sends low-stock email after deduction if any ingredient falls below threshold.
 * @param {Array} items - order items (with size, quantity, extraCheese, toppings)
 * @param {mongoose.ClientSession} [session]
 */
export const deductInventory = async (items, session) => {
  const requirements = buildRequirements(items);
  const names = Object.keys(requirements);
  if (names.length === 0) return;

  const query = Inventory.find({ ingredientName: { $in: names } });
  if (session) query.session(session);
  const records = await query;

  const lowItems = [];

  for (const record of records) {
    const needed = requirements[record.ingredientName.toLowerCase()] || 0;
    if (needed <= 0) continue;

    record.quantity = Math.max(0, record.quantity - needed);

    if (session) {
      await record.save({ session });
    } else {
      await record.save();
    }

    // Collect items at or below threshold for email
    if (record.quantity <= record.threshold) {
      lowItems.push(record);
    }
  }

  // Fire-and-forget email — never blocks the order flow
  if (lowItems.length > 0) {
    sendLowStockAlert(lowItems).catch(() => {});
  }
};

/**
 * Restore inventory when an order is cancelled.
 * @param {Array} items - order items
 * @param {mongoose.ClientSession} [session]
 */
export const restoreInventory = async (items, session) => {
  const requirements = buildRequirements(items);
  const names = Object.keys(requirements);
  if (names.length === 0) return;

  const query = Inventory.find({ ingredientName: { $in: names } });
  if (session) query.session(session);
  const records = await query;

  for (const record of records) {
    const restored = requirements[record.ingredientName.toLowerCase()] || 0;
    if (restored <= 0) continue;

    record.quantity += restored;

    if (session) {
      await record.save({ session });
    } else {
      await record.save();
    }
  }
};
