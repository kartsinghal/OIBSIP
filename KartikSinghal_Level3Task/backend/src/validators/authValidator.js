const EMAIL_RE = /^\S+@\S+\.\S+$/;

export const validateSignup = (req, res, next) => {
  const { fullName, email, password } = req.body;
  const errors = {};

  if (!fullName?.trim()) errors.fullName = 'Full name is required';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'A valid email is required';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';

  if (Object.keys(errors).length) {
    const err = new Error('Validation Failed');
    err.statusCode = 400;
    err.errors = errors;
    return next(err);
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !EMAIL_RE.test(email)) errors.email = 'A valid email is required';
  if (!password) errors.password = 'Password is required';

  if (Object.keys(errors).length) {
    const err = new Error('Validation Failed');
    err.statusCode = 400;
    err.errors = errors;
    return next(err);
  }

  next();
};
