import Joi from 'joi';

export const gaushalaSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Gaushala name is required'
  }),
  city: Joi.string().optional().allow(''),
  taluka: Joi.string().optional().allow(''),
  village: Joi.string().optional().allow(''),
  locationId: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional()
});

export const kathaSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Katha name is required'
  }),
  city: Joi.string().optional().allow(''),
  taluka: Joi.string().optional().allow(''),
  village: Joi.string().optional().allow(''),
  locationId: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional()
});
