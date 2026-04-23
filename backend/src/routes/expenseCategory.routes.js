import express from 'express';
import {
  addExpenseCategory,
  getExpenseCategories,
  updateExpenseCategory,
  deleteExpenseCategory,
} from '../controllers/expenseCategoryController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../validators/validate.js';
import { expenseCategorySchema } from '../validators/expenseCategory.validator.js';

const router = express.Router();

router.route('/')
  .get(protect, adminOnly, getExpenseCategories)
  .post(protect, adminOnly, validate(expenseCategorySchema), addExpenseCategory);

router.route('/:id')
  .put(protect, adminOnly, validate(expenseCategorySchema), updateExpenseCategory)
  .delete(protect, adminOnly, deleteExpenseCategory);

export default router;
