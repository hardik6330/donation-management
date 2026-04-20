/**
 * Create an error with an HTTP status code for use with asyncHandler.
 */
export const createHttpError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Not Found Error (404)
 * If the message doesn't contain "not found", it appends it.
 */
export const notFound = (message = 'Resource') => {
  const finalMessage = message.toLowerCase().includes('not found') 
    ? message 
    : `${message} not found`;
  return createHttpError(finalMessage, 404);
};

export const badRequest = (message) => createHttpError(message, 400);
export const unauthorized = (message = 'Unauthorized access') => createHttpError(message, 401);
export const forbidden = (message = 'Forbidden access') => createHttpError(message, 403);
export const conflict = (message) => createHttpError(message, 409);
export const internalServer = (message = 'Internal Server Error') => createHttpError(message, 500);
