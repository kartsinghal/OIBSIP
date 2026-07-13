import Pizza from '../models/Pizza.js';
import asyncHandler from '../utils/asyncHandler.js';
import { CUSTOMIZATION_OPTION_GROUPS } from '../config/customizationOptions.js';
import {
  extractIngredientNamesFromPizza,
  syncInventoryIngredients,
} from '../services/inventoryService.js';

/**
 * GET /api/pizzas/customization-options
 * Returns Build Your Own Pizza options from the backend source of truth.
 */
export const getCustomizationOptions = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: CUSTOMIZATION_OPTION_GROUPS,
  });
});

/**
 * GET /api/pizzas
 * Returns all available pizzas. Supports optional ?category= filter.
 */
export const getAllPizzas = asyncHandler(async (req, res) => {
  const filter = { isAvailable: true };
  if (req.query.category) filter.category = req.query.category;

  const pizzas = await Pizza.find(filter).sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: pizzas.length, data: pizzas });
});

/**
 * GET /api/pizzas/:id
 * Returns a single pizza by ID.
 */
export const getPizzaById = asyncHandler(async (req, res) => {
  const pizza = await Pizza.findById(req.params.id);

  if (!pizza) {
    const err = new Error('Pizza not found');
    err.statusCode = 404;
    throw err;
  }

  res.status(200).json({ success: true, data: pizza });
});

/**
 * POST /api/pizzas
 * Creates a new pizza.
 */
export const createPizza = asyncHandler(async (req, res) => {
  const pizza = await Pizza.create(req.body);
  await syncInventoryIngredients(extractIngredientNamesFromPizza(pizza));

  res.status(201).json({
    success: true,
    message: 'Pizza created successfully',
    data: pizza,
  });
});
