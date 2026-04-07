import { NODE_ENV } from '../config/db.js';
/**
 * @description Universal response handler for consistent API responses
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {any} data - Data to send in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {any} error - Optional error details (for debugging)
 */
export const sendError = (res, message = 'Internal Server Error', statusCode = 500, error = null) => {
  let finalMessage = message;
  let errorDetails = null;

  if (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const validationErrors = error.errors.map(err => err.message).join(', ');
      finalMessage = validationErrors; // Set the main message to the validation error
      statusCode = 400; // Bad Request for validation errors
    } else {
      errorDetails = error.message || error;
    }
  }

  const response = {
    success: false,
    message: finalMessage,
  };

  if (errorDetails) {
    response.error = errorDetails;
  }

  if (error && NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

export default {
  sendSuccess,
  sendError,
};
