import Joi from 'joi';

export const locationSchema = Joi.object({
  city: Joi.string().required().messages({
    'any.required': 'City name is required'
  }),
  taluka: Joi.string().optional().allow(''),
  village: Joi.string().optional().allow('')
});

export const categorySchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Category name is required'
  }),
  description: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional()
});

export const combinedMasterSchema = Joi.object({
  city: Joi.string().optional().allow(''),
  taluka: Joi.string().optional().allow(''),
  village: Joi.string().optional().allow(''),
  categoryName: Joi.string().optional().allow(''),
  categoryDescription: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional()
});
