import Joi from 'joi';

export const expenseCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'any.required': 'Category name is required',
    'string.empty': 'Category name is required',
  }),
});
