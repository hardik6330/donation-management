import Joi from 'joi';

export const incomeSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required'
  }),
  date: Joi.date().iso().required().messages({
    'date.base': 'Valid date is required',
    'any.required': 'Date is required'
  }),
  amount: Joi.number().positive().required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  }),
  note: Joi.string().allow('', null)
});
