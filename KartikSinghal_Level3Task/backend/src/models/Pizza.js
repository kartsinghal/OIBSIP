import mongoose from 'mongoose';

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pizza name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan'],
      required: [true, 'Category is required'],
    },
    sizes: {
      type: [String],
      enum: ['small', 'medium', 'large'],
      default: ['medium'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

pizzaSchema.index({ name: 1 });
pizzaSchema.index({ category: 1 });

const Pizza = mongoose.model('Pizza', pizzaSchema);
export default Pizza;
