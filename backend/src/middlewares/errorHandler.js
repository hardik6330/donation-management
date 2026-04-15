import { sendError } from '../utils/apiResponse.js';
import { NODE_ENV } from '../config/env.js';

/**
 * Global Error Handling Middleware
 * Catch all errors and return a consistent API response
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${err.stack}`);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  return sendError(res, message, statusCode, NODE_ENV === 'development' ? err : undefined);
};
