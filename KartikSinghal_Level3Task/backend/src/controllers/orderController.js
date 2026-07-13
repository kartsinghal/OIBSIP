import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Pizza from '../models/Pizza.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateStatusTransition } from '../utils/orderStateMachine.js';
import { extractIngredientNamesFromPizza, restoreInventory } from '../services/inventoryService.js';
import { generatePublicOrderId } from '../utils/publicOrderId.js';

/**
 * GET /api/orders
 * Admin route: Returns all orders.
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'fullName email')
    .populate('items.pizza', 'name basePrice')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: orders.length, data: orders });
});

/**
 * PATCH /api/orders/:id/status
 * Admin route: Updates order status strictly enforcing the state machine.
 * If status transitions to 'cancelled' and order was confirmed, restores inventory.
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  // Prevent invalid transitions (e.g. delivered -> pending)
  validateStatusTransition(order.orderStatus, status);

  const wasConfirmed = ['confirmed', 'preparing', 'baking'].includes(order.orderStatus);

  order.orderStatus = status;
  await order.save();

  // ── Cancellation Restock ────────────────────────────────────────────────────
  // Only restore inventory if the order had already been confirmed (i.e. stock was deducted)
  if (status === 'cancelled' && wasConfirmed) {
    try {
      await restoreInventory(order.items);
      console.log(`[Inventory] Restored stock for cancelled order ${order._id}`);
    } catch (err) {
      // Log but don't fail the status update
      console.error('[Inventory] Failed to restore stock on cancellation:', err.message);
    }
  }

  res.status(200).json({
    success: true,
    message: `Order successfully updated to ${status}`,
    data: order,
  });
});

/**
 * PATCH /api/orders/:id/payment-status
 * Admin route: Updates order payment status (e.g. marking COD as paid).
 */
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  // Only allow valid payment statuses based on schema
  const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
  if (!validStatuses.includes(paymentStatus)) {
    const err = new Error('Invalid payment status');
    err.statusCode = 400;
    throw err;
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  res.status(200).json({
    success: true,
    message: `Order payment status successfully updated to ${paymentStatus}`,
    data: order,
  });
});

/**
 * GET /api/orders/my-orders
 * Returns all orders for the authenticated user.
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.pizza', 'name basePrice')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: orders.length, data: orders });
});

/**
 * GET /api/orders/:id
 * Accepts EITHER a publicId (INF-2026-XXXXXX) OR a MongoDB _id.
 * Verifies ownership if the requester is not admin.
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Determine lookup strategy: publicId starts with 'INF-', otherwise treat as _id
  const isPublicId = /^INF-\d{4}-[A-Z0-9]{6}$/.test(id);

  let order;
  if (isPublicId) {
    order = await Order.findOne({ publicId: id })
      .populate('user', 'fullName email')
      .populate('items.pizza', 'name basePrice');
  } else {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('Invalid order ID format');
      err.statusCode = 400;
      throw err;
    }
    order = await Order.findById(id)
      .populate('user', 'fullName email')
      .populate('items.pizza', 'name basePrice');
  }

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  // Authorization check (user can only see own orders)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const err = new Error('Not authorized to view this order');
    err.statusCode = 403;
    throw err;
  }

  res.status(200).json({ success: true, data: order });
});

/**
 * GET /api/orders/track/:publicId
 * Public (no auth) endpoint — looks up an order by its publicId only.
 * Does NOT expose user PII. Safe for unauthenticated tracking.
 */
export const trackOrderByPublicId = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!/^INF-\d{4}-[A-Z0-9]{6}$/.test(publicId)) {
    const err = new Error('Invalid Order ID format. Expected: INF-YYYY-XXXXXX');
    err.statusCode = 400;
    throw err;
  }

  const order = await Order.findOne({ publicId })
    .populate('items.pizza', 'name basePrice')
    .select('-user'); // strip user PII for public endpoint

  if (!order) {
    const err = new Error('Order not found. Please check the Order ID and try again.');
    err.statusCode = 404;
    throw err;
  }

  res.status(200).json({ success: true, data: order });
});

/**
 * POST /api/orders
 * Creates an order snapshot from the current cart and clears the cart.
 * Inventory is NOT deducted here — deduction happens at payment confirmation.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, notes } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ── 1. Fetch user's cart ────────────────────────────────────────────────────
    const cart = await Cart.findOne({ user: req.user._id }).session(session);

    if (!cart || cart.items.length === 0) {
      const err = new Error('Cart is empty. Cannot checkout.');
      err.statusCode = 400;
      throw err;
    }

    const pizzaIds = [...new Set(cart.items.map((item) => item.pizza?.toString()).filter(Boolean))];
    const pizzas = await Pizza.find({ _id: { $in: pizzaIds } })
      .select('name description ingredients')
      .session(session);
    const pizzaIngredientsById = new Map(
      pizzas.map((pizza) => [pizza._id.toString(), extractIngredientNamesFromPizza(pizza)])
    );

    // ── 2. Generate a unique publicId ───────────────────────────────────────────
    let publicId;
    let attempts = 0;
    do {
      publicId = generatePublicOrderId();
      const exists = await Order.findOne({ publicId }).session(session).lean();
      if (!exists) break;
      attempts++;
    } while (attempts < 5);

    // ── 3. Create Immutable Order Snapshot ──────────────────────────────────────
    // Inventory check + deduction happen AFTER payment confirmation (in paymentController)
    const orderItems = cart.items.map(item => ({
      pizza: item.pizza,
      quantity: item.quantity,
      size: item.size,
      crust: item.crust,
      base: item.base || '',
      sauce: item.sauce || '',
      cheese: item.cheese || '',
      extraCheese: item.extraCheese,
      veggies: item.veggies || [],
      meat: item.meat || [],
      toppings: item.toppings,
      pizzaIngredients: item.pizzaIngredients?.length
        ? item.pizzaIngredients
        : pizzaIngredientsById.get(item.pizza?.toString()) || [],
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }));

    const [order] = await Order.create([{
      publicId,
      user: req.user._id,
      items: orderItems,
      totalPrice: cart.cartTotal,
      deliveryAddress,
      notes: notes || '',
      orderStatus: 'pending',
      paymentStatus: 'pending',
    }], { session });

    // ── 4. Clear Cart ───────────────────────────────────────────────────────────
    cart.items = [];
    cart.cartTotal = 0;
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
