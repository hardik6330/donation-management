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
  const response = {
    success: false,
    message,
  };

  if (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      response.error = error.errors.map(err => err.message).join(', ');
      statusCode = 400; // Bad Request for validation errors
    } else {
      // For other errors, show message in production, full stack in development
      response.error = error.message || error;
      
      if (process.env.NODE_ENV === 'development' && error.stack) {
        response.stack = error.stack;
      }
    }
  }

  return res.status(statusCode).json(response);
};

export default {
  sendSuccess,
  sendError,
};
