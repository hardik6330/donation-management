import Joi from 'joi';

export const roleSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Role name is required'
  }),
  permissions: Joi.object().optional(),
  description: Joi.string().optional().allow('')
});
