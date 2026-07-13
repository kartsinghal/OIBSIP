import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pizza',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      required: true,
    },
    crust: {
      type: String,
      enum: ['thin', 'classic', 'thick'],
      default: 'classic',
    },
    base: {
      type: String,
      trim: true,
      default: '',
    },
    sauce: {
      type: String,
      trim: true,
      default: '',
    },
    cheese: {
      type: String,
      trim: true,
      default: '',
    },
    extraCheese: {
      type: Boolean,
      default: false,
    },
    veggies: {
      type: [String],
      default: [],
    },
    meat: {
      type: [String],
      default: [],
    },
    toppings: {
      type: [String],
      default: [],
    },
    pizzaIngredients: {
      type: [String],
      default: [],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true } // each item gets its own _id for PATCH/DELETE by itemId
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one cart per user
    },
    items: [cartItemSchema],
    cartTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
