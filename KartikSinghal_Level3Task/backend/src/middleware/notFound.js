/**
 * 404 Route Not Found middleware.
 * Forwards a formatted 404 error to the global error handler.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

export default notFound;
