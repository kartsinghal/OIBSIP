import Pizza from '../models/Pizza.js';
import asyncHandler from '../utils/asyncHandler.js';

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

  res.status(201).json({
    success: true,
    message: 'Pizza created successfully',
    data: pizza,
  });
});
