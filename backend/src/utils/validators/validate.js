import { sendError } from '../apiResponse.js';

/**
 * Middleware to validate request body/query/params using Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Property to validate (body, query, params)
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return sendError(res, errorMessage, 400);
    }
    
    next();
  };
};
