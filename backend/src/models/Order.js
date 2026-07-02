import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    items: [
      {
        pizza: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Pizza',
          required: [true, 'Pizza ID is required'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
        size: {
          type: String,
          enum: ['small', 'medium', 'large'],
          required: [true, 'Size is required'],
        },
        crust: {
          type: String,
          enum: ['thin', 'classic', 'thick'],
          default: 'classic',
        },
        extraCheese: {
          type: Boolean,
          default: false,
        },
        toppings: {
          type: [String],
          default: [],
        },
        unitPrice: {
          type: Number,
          required: [true, 'Unit price is required'],
          min: [0, 'Unit price cannot be negative'],
        },
        subtotal: {
          type: Number,
          required: [true, 'Subtotal is required'],
          min: [0, 'Subtotal cannot be negative'],
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'baking', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      default: 'online',
    },
    deliveryAddress: {
      street: { type: String, required: [true, 'Street address is required'] },
      city: { type: String, required: [true, 'City is required'] },
      pincode: { type: String, required: [true, 'Pincode is required'] },
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes for common queries
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
