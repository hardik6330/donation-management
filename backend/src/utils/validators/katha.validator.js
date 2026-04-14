import Joi from 'joi';

export const kathaSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Katha name is required'
  }),
  city: Joi.string().optional().allow(''),
  taluka: Joi.string().optional().allow(''),
  village: Joi.string().optional().allow(''),
  locationId: Joi.string().optional().allow(''),
  startDate: Joi.date().optional().allow(null),
  endDate: Joi.date().optional().allow(null),
  status: Joi.string().valid('upcoming', 'active', 'completed').optional(),
  description: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional()
});
