import mongoose from 'mongoose';

const normalizeIngredientName = (value) =>
  String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const inventorySchema = new mongoose.Schema(
  {
    ingredientName: {
      type: String,
      required: [true, 'Ingredient name is required'],
      unique: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      trim: true,
      lowercase: true,
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

inventorySchema.pre('validate', function setNormalizedName(next) {
  this.ingredientName = String(this.ingredientName || '').trim().replace(/\s+/g, ' ');
  this.normalizedName = normalizeIngredientName(this.ingredientName);
  next();
});

inventorySchema.index({ normalizedName: 1 }, { unique: true, sparse: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
