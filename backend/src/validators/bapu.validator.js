import Joi from 'joi';

export const bapuScheduleSchema = Joi.object({
  date: Joi.date().required().messages({
    'date.base': 'Invalid date format',
    'any.required': 'Date is required'
  }),
  time: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  taluka: Joi.string().optional().allow(''),
  village: Joi.string().optional().allow(''),
  locationId: Joi.string().optional().allow(''),
  eventType: Joi.string().valid('Padhramani', 'Katha', 'Event', 'Personal').optional(),
  contactPerson: Joi.string().optional().allow(''),
  mobileNumber: Joi.string().pattern(/^[0-9]+$/).optional().allow('').messages({
    'string.pattern.base': 'Mobile number must contain only numbers'
  }),
  description: Joi.string().optional().allow(''),
  amount: Joi.number().min(0).optional().allow(null),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional()
});
