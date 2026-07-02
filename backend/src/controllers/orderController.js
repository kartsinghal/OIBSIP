import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateStatusTransition } from '../utils/orderStateMachine.js';
import { restoreInventory } from '../services/inventoryService.js';

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
 * Returns a single order by ID (verifying ownership if not admin).
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'fullName email')
    .populate('items.pizza', 'name basePrice');

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

    // ── 2. Create Immutable Order Snapshot ──────────────────────────────────────
    // Inventory check + deduction happen AFTER payment confirmation (in paymentController)
    const orderItems = cart.items.map(item => ({
      pizza: item.pizza,
      quantity: item.quantity,
      size: item.size,
      crust: item.crust,
      extraCheese: item.extraCheese,
      toppings: item.toppings,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }));

    const [order] = await Order.create([{
      user: req.user._id,
      items: orderItems,
      totalPrice: cart.cartTotal,
      deliveryAddress,
      notes: notes || '',
      orderStatus: 'pending',
      paymentStatus: 'pending',
    }], { session });

    // ── 3. Clear Cart ───────────────────────────────────────────────────────────
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
