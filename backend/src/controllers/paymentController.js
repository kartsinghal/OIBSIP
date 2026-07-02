import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getRazorpayInstance, verifyRazorpaySignature } from '../utils/razorpay.js';
import { checkInventory, deductInventory, buildRequirements } from '../services/inventoryService.js';

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order tied to an existing database Order.
 * Body: { orderId }
 */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (order.user.toString() !== req.user._id.toString()) {
    const err = new Error('Not authorized for this order');
    err.statusCode = 403;
    throw err;
  }

  if (order.paymentStatus === 'paid') {
    const err = new Error('Order is already paid');
    err.statusCode = 400;
    throw err;
  }

  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    const err = new Error('Payment gateway not configured');
    err.statusCode = 503;
    throw err;
  }

  const options = {
    amount: Math.round(order.totalPrice * 100),
    currency: 'INR',
    receipt: `rcpt_${order._id}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  res.status(200).json({
    success: true,
    data: razorpayOrder,
  });
});

/**
 * POST /api/payment/verify
 * Verifies the Razorpay (or mock) signature, checks + deducts inventory,
 * then marks order as confirmed.
 * Body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  // ── Signature verification ──────────────────────────────────────────────────
  // In test/dev mode accept mock_signature (MockRazorpayModal)
  const isMock = razorpay_signature === 'mock_signature';
  const isValid = isMock
    ? process.env.NODE_ENV !== 'production'
    : verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (!isValid) {
    order.paymentStatus = 'failed';
    await order.save();
    const err = new Error('Payment verification failed. Invalid signature.');
    err.statusCode = 400;
    throw err;
  }

  // ── Inventory check + deduction (happens HERE, after payment confirmed) ─────
  const requirements = buildRequirements(order.items);
  await checkInventory(requirements);   // throws 409 if out of stock
  await deductInventory(order.items);   // deducts + sends low-stock email if needed

  // ── Confirm order ───────────────────────────────────────────────────────────
  order.paymentStatus = 'paid';
  order.paymentMethod = 'online';
  order.orderStatus = 'confirmed';
  order.razorpayPaymentId = razorpay_payment_id || '';
  order.razorpayOrderId = razorpay_order_id || '';
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: { orderId: order._id },
  });
});

/**
 * POST /api/payment/confirm-cod
 * Confirms a Cash on Delivery order.
 * Checks + deducts inventory, then marks order as confirmed.
 * Body: { orderId }
 */
export const confirmCOD = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (order.user.toString() !== req.user._id.toString()) {
    const err = new Error('Not authorized for this order');
    err.statusCode = 403;
    throw err;
  }

  if (order.orderStatus !== 'pending') {
    const err = new Error(`Order is already ${order.orderStatus}`);
    err.statusCode = 400;
    throw err;
  }

  // ── Inventory check + deduction (same as online payment path) ──────────────
  const requirements = buildRequirements(order.items);
  await checkInventory(requirements);   // throws 409 if out of stock
  await deductInventory(order.items);   // deducts + sends low-stock email if needed

  // ── Confirm order ───────────────────────────────────────────────────────────
  order.paymentMethod = 'cod';
  order.paymentStatus = 'pending';   // collected at delivery
  order.orderStatus = 'confirmed';   // enters kitchen queue
  await order.save();

  res.status(200).json({
    success: true,
    message: 'COD order confirmed successfully',
    data: { orderId: order._id },
  });
});
