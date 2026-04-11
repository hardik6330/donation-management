import Joi from 'joi';

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
  address: Joi.string().optional().allow(''),
  village: Joi.string().optional().allow(''),
  district: Joi.string().optional().allow(''),
  companyName: Joi.string().optional().allow(''),
  referenceName: Joi.string().optional().allow(''),
  paidAmount: Joi.number().min(0).optional().allow(null),
  cityName: Joi.string().optional().allow(''),
  talukaName: Joi.string().optional().allow(''),
  villageName: Joi.string().optional().allow('')
});
