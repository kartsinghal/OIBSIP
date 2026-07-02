/**
 * Validates request body for Checkout / Order creation.
 * Items are securely fetched from the user's cart, so we only validate checkout metadata.
 */
export const validateOrderCreate = (req, res, next) => {
  const { deliveryAddress, paymentStatus } = req.body;
  const errors = {};

  // ── deliveryAddress ─────────────────────────────────────────────────────────
  if (!deliveryAddress || typeof deliveryAddress !== 'object') {
    errors.deliveryAddress = 'Delivery address is required and must be an object';
  } else {
    const { street, city, pincode } = deliveryAddress;
    if (!street || typeof street !== 'string' || !street.trim()) {
      errors['deliveryAddress.street'] = 'Street address is required';
    }
    if (!city || typeof city !== 'string' || !city.trim()) {
      errors['deliveryAddress.city'] = 'City is required';
    }
    if (!pincode || typeof pincode !== 'string' || !pincode.trim()) {
      errors['deliveryAddress.pincode'] = 'Pincode is required';
    }
  }

  // ── paymentStatus (optional placeholder) ────────────────────────────────────
  if (paymentStatus && !['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
    errors.paymentStatus = 'Invalid payment status';
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
