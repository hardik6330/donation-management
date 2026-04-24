import express from 'express';
import {
  addExpense,
  getAllExpenses,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getExpenseInstallments
} from '../controllers/expenseController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../validators/validate.js';
import { expenseSchema, expenseUpdateSchema } from '../validators/expense.validator.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, validate(expenseSchema), addExpense)
  .get(protect, adminOnly, getAllExpenses);

router.get('/stats', protect, adminOnly, getExpenseStats);
router.get('/:id/installments', protect, adminOnly, getExpenseInstallments);

router.route('/:id')
  .put(protect, adminOnly, validate(expenseUpdateSchema), updateExpense)
  .delete(protect, adminOnly, deleteExpense);

export default router;
