import Joi from 'joi';

export const expenseSchema = Joi.object({
  date: Joi.date().optional().messages({
    'date.base': 'Invalid date format'
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required'
  }),
  category: Joi.string().trim().min(1).max(100).required().messages({
    'any.required': 'Category is required',
    'string.empty': 'Category is required'
  }),
  description: Joi.string().optional().allow(''),
  gaushalaId: Joi.string().uuid().optional().allow(null, ''),
  kathaId: Joi.string().uuid().optional().allow(null, ''),
  paymentMode: Joi.string().valid('cash', 'online', 'check').optional(),
  status: Joi.string().valid('completed', 'pay_later', 'partially_paid').optional(),
  paidAmount: Joi.alternatives().conditional('status', {
    is: 'partially_paid',
    then: Joi.number().positive().required().messages({
      'number.positive': 'Paid amount must be greater than 0',
      'any.required': 'Paid amount is required for partially paid',
    }),
    otherwise: Joi.any().optional(),
  }),
  remainingAmount: Joi.number().min(0).optional(),
  notes: Joi.string().optional().allow(''),
});

export const expenseUpdateSchema = Joi.object({
  date: Joi.date().optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string().trim().min(1).max(100).optional(),
  description: Joi.string().optional().allow(''),
  gaushalaId: Joi.string().uuid().optional().allow(null, ''),
  kathaId: Joi.string().uuid().optional().allow(null, ''),
  paymentMode: Joi.string().valid('cash', 'online', 'check').optional(),
  status: Joi.string().valid('completed', 'pay_later', 'partially_paid').optional(),
  paidAmount: Joi.number().min(0).optional(),
  remainingAmount: Joi.number().min(0).optional(),
  notes: Joi.string().optional().allow(''),
});
