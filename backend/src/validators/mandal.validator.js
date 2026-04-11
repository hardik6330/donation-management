import Joi from 'joi';

export const mandalSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Mandal name is required'
  }),
  price: Joi.number().positive().required().messages({
    'number.positive': 'Price must be greater than 0',
    'any.required': 'Price is required'
  }),
  mandalType: Joi.string().valid('monthly', 'yearly', 'onetime').optional(),
  isActive: Joi.boolean().optional()
});

export const mandalMemberSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Member name is required'
  }),
  mobileNumber: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'Mobile number must be 10 digits',
    'any.required': 'Mobile number is required'
  }),
  mandalId: Joi.string().uuid().required().messages({
    'any.required': 'Mandal is required'
  }),
  joinDate: Joi.date().optional(),
  isActive: Joi.boolean().optional()
});

export const generatePaymentSchema = Joi.object({
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).required().messages({
    'string.pattern.base': 'Month must be in YYYY-MM format',
    'any.required': 'Month is required'
  }),
  mandalId: Joi.string().uuid().optional().allow(null, '')
});
