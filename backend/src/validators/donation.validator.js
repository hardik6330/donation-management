import Joi from 'joi';

export const donationSchema = Joi.object({
  amount: Joi.number().min(0).required().messages({
    'number.base': 'Amount must be a number',
    'number.min': 'Amount cannot be negative',
    'any.required': 'Amount is required'
  }),
  mobileNumber: Joi.string().pattern(/^[0-9]+$/).optional().allow('', null).messages({
    'string.pattern.base': 'Mobile number must contain only digits'
  }),
  name: Joi.string().required().messages({
    'any.required': 'Donor name is required'
  }),
  paymentMode: Joi.string().valid('online', 'cash', 'cheque').required().messages({
    'any.only': 'Invalid payment mode'
  }),
  status: Joi.string().valid('pending', 'completed', 'failed', 'partially_paid', 'pay_later').optional().messages({
    'any.only': 'Invalid status'
  }),
  categoryId: Joi.string().optional().allow(''),
  gaushalaId: Joi.string().optional().allow(''),
  kathaId: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  companyName: Joi.string().optional().allow(''),
  referenceName: Joi.string().optional().allow(''),
  slipNo: Joi.string().optional().allow('', null),
  paymentDate: Joi.date().optional().allow(null, ''),
  donationDate: Joi.date().optional().allow(null, ''),
  notes: Joi.string().optional().allow('', null),
  paidAmount: Joi.number()
    .when('status', {
      is: 'partially_paid',
      then: Joi.number().positive().less(Joi.ref('amount')).required().messages({
        'number.base': 'Paid amount must be a number',
        'number.positive': 'Paid amount must be greater than 0',
        'number.less': 'Paid amount must be less than total donation amount',
        'any.required': 'Paid amount is required for partial payment'
      }),
      otherwise: Joi.number().min(0).optional().allow(null)
    })
});

export const donationUpdateSchema = Joi.object({
  amount: Joi.number().min(0).optional().messages({
    'number.base': 'Amount must be a number',
    'number.min': 'Amount cannot be negative'
  }),
  cause: Joi.string().optional().allow(''),
  status: Joi.string().valid('pending', 'completed', 'failed', 'partially_paid', 'pay_later').optional(),
  paymentMode: Joi.string().valid('online', 'cash', 'cheque').optional(),
  paymentDate: Joi.date().optional().allow(null, ''),
  categoryId: Joi.string().optional().allow('', null),
  paidAmount: Joi.number().min(0).optional().allow(null).messages({
    'number.base': 'Paid amount must be a number',
    'number.min': 'Paid amount cannot be negative'
  }),
  remainingAmount: Joi.number().min(0).optional().allow(null).messages({
    'number.base': 'Remaining amount must be a number',
    'number.min': 'Remaining amount cannot be negative'
  }),
  notes: Joi.string().optional().allow('', null),
  slipNo: Joi.string().optional().allow('', null)
}).custom((value, helpers) => {
  if (value.amount !== undefined && value.paidAmount !== undefined && value.paidAmount !== null) {
    if (Number(value.paidAmount) > Number(value.amount)) {
      return helpers.message('Paid amount cannot exceed total donation amount');
    }
  }
  return value;
});
