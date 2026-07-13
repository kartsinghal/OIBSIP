/**
 * Validates request body for creating an Inventory item.
 */
export const validateInventoryCreate = (req, res, next) => {
  const { ingredientName, quantity, threshold, unit } = req.body;
  const errors = {};

  if (!ingredientName || typeof ingredientName !== 'string' || ingredientName.trim() === '') {
    errors.ingredientName = 'Ingredient name is required';
  }

  if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
    errors.quantity = 'Quantity is required and must be a non-negative number';
  }

  if (threshold === undefined || typeof threshold !== 'number' || threshold < 0) {
    errors.threshold = 'Threshold is required and must be a non-negative number';
  }

  if (!unit || typeof unit !== 'string' || unit.trim() === '') {
    errors.unit = 'Unit is required (e.g. g, ml, kg, pcs)';
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error('Validation Failed');
    error.name = 'ValidationError';
    error.errors = Object.keys(errors).reduce((acc, key) => {
      acc[key] = { message: errors[key] };
      return acc;
    }, {});
    error.statusCode = 400;
    return next(error);
  }

  next();
};
