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
  mobileNumber: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'Mobile number must be 10 digits',
    'string.pattern.base': 'Mobile number must contain only numbers',
    'any.required': 'Mobile number is required'
  }),
  password: Joi.string().min(6).optional(),
  address: Joi.string().optional().allow(''),
  village: Joi.string().optional().allow(''),
  district: Joi.string().optional().allow(''),
  companyName: Joi.string().optional().allow(''),
});

// Donation Validation
export const donationSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required'
  }),
  mobileNumber: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'Mobile number must be 10 digits',
    'any.required': 'Mobile number is required'
  }),
  name: Joi.string().required().messages({
    'any.required': 'Donor name is required'
  }),
  paymentMode: Joi.string().valid('online', 'cash', 'pay_later', 'cheque', 'partially_paid').required().messages({
    'any.only': 'Invalid payment mode'
  }),
  cityId: Joi.string().optional().allow(''),
  talukaId: Joi.string().optional().allow(''),
  villageId: Joi.string().optional().allow(''),
  categoryId: Joi.string().optional().allow(''),
  gaushalaId: Joi.string().optional().allow(''),
  kathaId: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
});
