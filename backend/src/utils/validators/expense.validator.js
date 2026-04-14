import Joi from 'joi';

export const expenseSchema = Joi.object({
  date: Joi.date().optional().messages({
    'date.base': 'Invalid date format'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required'
  }),
  category: Joi.string().valid('Food', 'Medicine', 'Maintenance', 'Salary', 'Utility', 'Other').required().messages({
    'any.only': 'Invalid category',
    'any.required': 'Category is required'
  }),
  description: Joi.string().optional().allow(''),
  gaushalaId: Joi.string().uuid().optional().allow(null, ''),
  kathaId: Joi.string().uuid().optional().allow(null, ''),
  paymentMode: Joi.string().valid('cash', 'online', 'check').optional()
});
