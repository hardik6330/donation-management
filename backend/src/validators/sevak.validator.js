import Joi from 'joi';

export const sevakSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Sevak name is required'
  }),
  mobileNumber: Joi.string().pattern(/^[0-9]+$/).required().messages({
    'string.pattern.base': 'Mobile number must contain only digits',
    'any.required': 'Mobile number is required'
  }),
  email: Joi.string().email().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional()
});
