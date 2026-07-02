import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    ingredientName: {
      type: String,
      required: [true, 'Ingredient name is required'],
      unique: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    threshold: {
      type: Number,
      required: [true, 'Threshold is required'],
      min: [0, 'Threshold cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit (e.g. g, ml, kg, pcs) is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
