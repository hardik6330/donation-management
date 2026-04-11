/**
 * Higher-order function to wrap async express routes and catch errors
 * Eliminates the need for try/catch in every controller
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
