/**
 * Validates the request body for creating a User.
 */
export const validateUserCreate = (req, res, next) => {
  const { fullName, email, password, role } = req.body;
  const errors = {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    errors.fullName = 'Full name is required and must be a string';
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'A valid email address is required';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.password = 'Password is required and must be at least 6 characters long';
  }

  if (role && !['customer', 'admin', 'kitchen'].includes(role)) {
    errors.role = 'Role must be customer, admin, or kitchen';
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
