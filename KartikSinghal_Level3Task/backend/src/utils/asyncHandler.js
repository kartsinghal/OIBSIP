/**
 * Wraps an async route handler so thrown errors are forwarded to
 * Express's next(err) without try/catch boilerplate in every controller.
 *
 * Usage:
 *   router.get('/', asyncHandler(myController));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
