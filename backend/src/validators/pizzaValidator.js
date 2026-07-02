/**
 * Validates request body for creating a Pizza.
 */
export const validatePizzaCreate = (req, res, next) => {
  const { name, description, category, basePrice, sizes, ingredients, image } = req.body;
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.name = 'Pizza name is required';
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.description = 'Description is required';
  }

  if (!category || !['veg', 'non-veg', 'vegan'].includes(category)) {
    errors.category = 'Category is required and must be either veg, non-veg, or vegan';
  }

  if (basePrice === undefined || typeof basePrice !== 'number' || basePrice < 0) {
    errors.basePrice = 'Base price is required and must be a non-negative number';
  }

  if (sizes && (!Array.isArray(sizes) || sizes.some(s => !['small', 'medium', 'large'].includes(s)))) {
    errors.sizes = 'Sizes must be an array containing small, medium, or large';
  }

  if (ingredients && !Array.isArray(ingredients)) {
    errors.ingredients = 'Ingredients must be an array of strings';
  }

  if (image && typeof image !== 'string') {
    errors.image = 'Image must be a valid URL or path string';
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
