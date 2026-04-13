/**
 * Create an error with an HTTP status code for use with asyncHandler.
 */
export const createHttpError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const notFound = (entity = 'Resource') => createHttpError(`${entity} not found`, 404);
export const badRequest = (message) => createHttpError(message, 400);
