import Cart from '../models/Cart.js';
import Pizza from '../models/Pizza.js';
import Inventory from '../models/Inventory.js';
import asyncHandler from '../utils/asyncHandler.js';
import { computeUnitPrice, validateBuilderOptions, VALID_SIZES } from '../utils/pricing.js';

const FALLBACK_PIZZAS = {
  Margherita: {
    description: 'San Marzano tomato, fior di latte, fresh basil, EVOO',
    category: 'veg',
    basePrice: 299,
  },
  Pepperoni: {
    description: 'Tomato base, mozzarella, premium beef pepperoni, oregano',
    category: 'non-veg',
    basePrice: 399,
  },
  'Truffle Funghi': {
    description: 'White truffle oil, wild mushrooms, fontina, fresh thyme',
    category: 'veg',
    basePrice: 549,
  },
  'Quattro Formaggi': {
    description: 'Mozzarella, gorgonzola, parmigiano, ricotta, acacia honey',
    category: 'veg',
    basePrice: 499,
  },
  'Custom Pizza': {
    description: 'Custom pizza from the builder',
    category: 'veg',
    basePrice: 449,
  },
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Recompute cartTotal from items and save. Returns the saved cart. */
const recalcAndSave = async (cart) => {
  cart.cartTotal = Math.round(
    cart.items.reduce((sum, item) => sum + item.subtotal, 0) * 100
  ) / 100;
  await cart.save();
  return cart.populate('items.pizza', 'name image basePrice');
};

/** Returns a normalised fingerprint for dedup comparison. */
const itemKey = (item) =>
  `${item.pizza}|${item.size}|${item.crust}|${!!item.extraCheese}|${[...(item.toppings || [])].sort().join(',')}`;

/** Validate pizza exists + is available, then run builder + inventory checks. */
async function validateItem(pizzaId, item) {
  // 1. Pizza exists & available
  const pizza = await Pizza.findById(pizzaId);
  if (!pizza) {
    const err = new Error(`Pizza ${pizzaId} not found`);
    err.statusCode = 404;
    throw err;
  }
  if (!pizza.isAvailable) {
    const err = new Error(`"${pizza.name}" is currently unavailable`);
    err.statusCode = 409;
    throw err;
  }

  // 2. Builder validation (size, crust, extraCheese, toppings shape)
  const builderErrors = validateBuilderOptions(item);
  if (builderErrors.length) {
    const err = new Error(builderErrors.join('; '));
    err.statusCode = 400;
    throw err;
  }

  // 3. Quantity check
  if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
    const err = new Error('quantity must be a number ≥ 1');
    err.statusCode = 400;
    throw err;
  }

  // 4. Inventory check for toppings
  const toppings = item.toppings || [];
  if (toppings.length > 0) {
    const records = await Inventory.find({ ingredientName: { $in: toppings } });
    const invMap = Object.fromEntries(records.map((r) => [r.ingredientName.toLowerCase(), r]));
    const outOfStock = toppings.filter((t) => invMap[t.toLowerCase()] && invMap[t.toLowerCase()].quantity <= 0);
    if (outOfStock.length) {
      const err = new Error(`Toppings out of stock: ${outOfStock.join(', ')}`);
      err.statusCode = 409;
      throw err;
    }
  }

  return pizza;
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/cart
 * Returns the authenticated user's cart.
 */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.pizza', 'name image basePrice');

  if (!cart) {
    return res.status(200).json({ success: true, data: { items: [], cartTotal: 0 } });
  }

  res.status(200).json({ success: true, data: cart });
});

/**
 * POST /api/cart/add
 * Add an item to the cart. Merges if identical customization already exists.
 *
 * Body: { pizza, quantity, size, crust?, extraCheese?, toppings? }
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { pizza: pizzaId, name, quantity = 1, size = 'medium', crust = 'classic', extraCheese = false, toppings = [] } = req.body;

  let finalPizzaId = pizzaId;
  const isValidId = /^[0-9a-fA-F]{24}$/.test(pizzaId);

  if (!isValidId) {
    const baseName = name ? name.split(' (')[0].trim() : '';
    let dbPizza = baseName
      ? await Pizza.findOne({ name: new RegExp(`^${escapeRegExp(baseName)}$`, 'i') })
      : null;
    if (!dbPizza && FALLBACK_PIZZAS[baseName]) {
      dbPizza = await Pizza.create({
        name: baseName,
        ...FALLBACK_PIZZAS[baseName],
        sizes: ['small', 'medium', 'large'],
        ingredients: toppings,
      });
    }
    if (!dbPizza) dbPizza = await Pizza.findOne();
    if (dbPizza) finalPizzaId = dbPizza._id.toString();
  }

  // Basic required-field check
  if (!finalPizzaId || !size || !VALID_SIZES.includes(size)) {
    const err = new Error('pizza and a valid size are required');
    err.statusCode = 400;
    throw err;
  }

  const item = { pizza: finalPizzaId, quantity, size, crust, extraCheese, toppings };
  const pizza = await validateItem(finalPizzaId, item);

  const unitPrice = computeUnitPrice(pizza.basePrice, size, crust, extraCheese, toppings);

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [], cartTotal: 0 });
  }

  // Merge check — same pizza + same customizations → increment quantity
  const incomingKey = itemKey({ pizza: finalPizzaId, size, crust, extraCheese, toppings });
  const existing = cart.items.find((i) => itemKey(i) === incomingKey);

  if (existing) {
    existing.quantity += quantity;
    existing.subtotal = Math.round(existing.unitPrice * existing.quantity * 100) / 100;
  } else {
    cart.items.push({
      pizza: finalPizzaId,
      quantity,
      size,
      crust,
      extraCheese,
      toppings,
      unitPrice,
      subtotal: Math.round(unitPrice * quantity * 100) / 100,
    });
  }

  const saved = await recalcAndSave(cart);
  res.status(200).json({ success: true, message: 'Item added to cart', data: saved });
});

/**
 * PATCH /api/cart/item/:itemId
 * Update quantity of a specific cart item.
 *
 * Body: { quantity }
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || typeof quantity !== 'number' || quantity < 1) {
    const err = new Error('quantity must be a number ≥ 1');
    err.statusCode = 400;
    throw err;
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    const err = new Error('Cart not found');
    err.statusCode = 404;
    throw err;
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    const err = new Error('Cart item not found');
    err.statusCode = 404;
    throw err;
  }

  item.quantity = quantity;
  item.subtotal = Math.round(item.unitPrice * quantity * 100) / 100;

  const saved = await recalcAndSave(cart);
  res.status(200).json({ success: true, message: 'Cart item updated', data: saved });
});

/**
 * DELETE /api/cart/item/:itemId
 * Remove a specific item from the cart.
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    const err = new Error('Cart not found');
    err.statusCode = 404;
    throw err;
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    const err = new Error('Cart item not found');
    err.statusCode = 404;
    throw err;
  }

  item.deleteOne();
  const saved = await recalcAndSave(cart);
  res.status(200).json({ success: true, message: 'Item removed from cart', data: saved });
});

/**
 * DELETE /api/cart/clear
 * Empty the entire cart.
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(200).json({ success: true, message: 'Cart already empty' });
  }

  cart.items = [];
  cart.cartTotal = 0;
  await cart.save();

  res.status(200).json({ success: true, message: 'Cart cleared' });
});
