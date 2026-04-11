import Joi from 'joi';

export const kartalDhunSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required'
  }),
  date: Joi.date().required().messages({
    'date.base': 'Invalid date format',
    'any.required': 'Date is required'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required'
  }),
  city: Joi.string().optional().allow(''),
  taluka: Joi.string().optional().allow(''),
  village: Joi.string().optional().allow(''),
  locationId: Joi.string().optional().allow(''),
  description: Joi.string().optional().allow('')
});
