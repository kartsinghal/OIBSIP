import Cart from '../models/Cart.js';
import Pizza from '../models/Pizza.js';
import asyncHandler from '../utils/asyncHandler.js';
import { computeUnitPrice, validateBuilderOptions, VALID_SIZES } from '../utils/pricing.js';
import {
  buildRequirements,
  checkInventory,
  extractIngredientNamesFromOrderItems,
  extractIngredientNamesFromPizza,
  normalizeIngredientName,
  syncInventoryIngredients,
} from '../services/inventoryService.js';

const FALLBACK_PIZZAS = {
  // Classic
  Margherita: { description: 'San Marzano tomato, fior di latte, fresh basil, EVOO', category: 'veg', basePrice: 299 },
  Pepperoni: { description: 'Tomato base, mozzarella, premium beef pepperoni, oregano', category: 'non-veg', basePrice: 399 },
  Napolitana: { description: 'Crushed tomato, anchovies, capers, black olives, oregano', category: 'non-veg', basePrice: 349 },
  Diavola: { description: 'Spicy salami, tomato, mozzarella, chilli flakes, fresh basil', category: 'non-veg', basePrice: 429 },
  Capricciosa: { description: 'Ham, artichokes, mushrooms, black olives, mozzarella', category: 'non-veg', basePrice: 449 },
  Marinara: { description: 'San Marzano tomato, garlic, oregano, EVOO — no cheese', category: 'veg', basePrice: 249 },
  'Prosciutto e Funghi': { description: 'Parma ham, wild mushrooms, mozzarella, fresh thyme', category: 'non-veg', basePrice: 479 },

  // Specialty
  'Truffle Funghi': { description: 'White truffle oil, wild mushrooms, fontina, fresh thyme', category: 'veg', basePrice: 549 },
  'Quattro Formaggi': { description: 'Mozzarella, gorgonzola, parmigiano, ricotta, acacia honey', category: 'veg', basePrice: 499 },
  'Burrata & Bresaola': { description: 'Creamy burrata, cured bresaola, rocket, lemon zest, EVOO', category: 'non-veg', basePrice: 649 },
  'Smoky BBQ Chicken': { description: 'Smoky BBQ base, grilled chicken, red onion, jalapeño, cheddar', category: 'non-veg', basePrice: 529 },
  'Prawn Aglio': { description: 'Tiger prawns, garlic oil, cherry tomato, parsley, mozzarella', category: 'non-veg', basePrice: 699 },
  'Fig & Gorgonzola': { description: 'Fresh fig, gorgonzola, walnuts, honey drizzle, rocket', category: 'veg', basePrice: 579 },
  'Speck & Pear': { description: 'Smoked speck, sliced pear, brie, balsamic glaze, toasted walnuts', category: 'non-veg', basePrice: 599 },

  // Vegan
  'Garden Primavera': { description: 'Tomato base, courgette, peppers, red onion, cherry tomato, basil', category: 'veg', basePrice: 349 },
  'Roasted Aubergine': { description: 'Smoky roasted aubergine, tahini, harissa, pine nuts, mint', category: 'veg', basePrice: 379 },
  'Pesto Verde': { description: 'Vegan basil pesto, cherry tomato, artichoke, capers, EVOO', category: 'veg', basePrice: 399 },
  'Mushroom Truffle': { description: 'Cashew cream base, mixed mushrooms, truffle oil, thyme, garlic', category: 'veg', basePrice: 449 },
  'Spicy Arrabiata': { description: 'Arrabiata sauce, olives, capers, chilli, roasted peppers', category: 'veg', basePrice: 329 },
  'Butternut Squash': { description: 'Roasted butternut squash, caramelised red onion, vegan feta, sage', category: 'veg', basePrice: 389 },
  'Fig & Rocket': { description: 'Fresh fig, vegan mozzarella, balsamic glaze, toasted pine nuts, rocket', category: 'veg', basePrice: 419 },

  'Custom Pizza': { description: 'Custom pizza from the builder', category: 'veg', basePrice: 449 },
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sortedList = (value) => [...(Array.isArray(value) ? value : [])].sort().join(',');

const getFallbackPizzaIngredients = (baseName, pizzaData, toppings = []) => {
  if (normalizeIngredientName(baseName) === 'custom pizza') return [];

  const ingredients = extractIngredientNamesFromPizza({
    name: baseName,
    description: pizzaData.description,
    ingredients: pizzaData.ingredients || [],
  });

  return ingredients.length > 0 ? ingredients : toppings;
};

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
  [
    item.pizza,
    item.size,
    item.crust,
    item.base || '',
    item.sauce || '',
    item.cheese || '',
    !!item.extraCheese,
    sortedList(item.veggies),
    sortedList(item.meat),
    sortedList(item.toppings),
  ].join('|');

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

  const inventoryItem = {
    ...item,
    pizzaIngredients: item.pizzaIngredients?.length
      ? item.pizzaIngredients
      : extractIngredientNamesFromPizza(pizza),
  };

  await checkInventory(buildRequirements([inventoryItem]));
  await syncInventoryIngredients(extractIngredientNamesFromOrderItems([inventoryItem]));

  return { pizza, pizzaIngredients: inventoryItem.pizzaIngredients };
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
  const {
    pizza: pizzaId,
    name,
    quantity = 1,
    size = 'medium',
    crust = 'classic',
    base = '',
    sauce = '',
    cheese = '',
    extraCheese = false,
    veggies = [],
    meat = [],
    toppings = [],
  } = req.body;

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
        ingredients: getFallbackPizzaIngredients(baseName, FALLBACK_PIZZAS[baseName], toppings),
      });
    }
    
    if (!dbPizza) {
      const err = new Error(`Pizza "${baseName}" not found and not in fallback menu`);
      err.statusCode = 404;
      throw err;
    }
    
    finalPizzaId = dbPizza._id.toString();
  }

  // Basic required-field check
  if (!finalPizzaId || !size || !VALID_SIZES.includes(size)) {
    const err = new Error('pizza and a valid size are required');
    err.statusCode = 400;
    throw err;
  }

  const item = { pizza: finalPizzaId, quantity, size, crust, base, sauce, cheese, extraCheese, veggies, meat, toppings };
  const { pizza, pizzaIngredients } = await validateItem(finalPizzaId, item);

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
      base,
      sauce,
      cheese,
      extraCheese,
      veggies,
      meat,
      toppings,
      pizzaIngredients,
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
