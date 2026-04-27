import Joi from 'joi';

// User Auth Validation
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  })
});

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  mobileNumber: Joi.string().pattern(/^[0-9]+$/).required().messages({
    'string.pattern.base': 'Mobile number must contain only numbers',
    'any.required': 'Mobile number is required'
  }),
  password: Joi.string().min(6).optional(),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  companyName: Joi.string().optional().allow(''),
});

// System User Validation
export const systemUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  mobileNumber: Joi.string().pattern(/^[0-9]+$/).required().messages({
    'string.pattern.base': 'Mobile number must contain only numbers',
    'any.required': 'Mobile number is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  roleId: Joi.string().uuid().optional().allow(null, ''),
  isAdmin: Joi.boolean().optional()
});
