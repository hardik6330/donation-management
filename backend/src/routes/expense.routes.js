import express from 'express';
import { 
  addExpense, 
  getAllExpenses, 
  updateExpense, 
  deleteExpense,
  getExpenseStats 
} from '../controllers/expenseController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../utils/validators/validate.js';
import { expenseSchema } from '../utils/validators/expense.validator.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, validate(expenseSchema), addExpense)
  .get(protect, adminOnly, getAllExpenses);

router.get('/stats', protect, adminOnly, getExpenseStats);

router.route('/:id')
  .put(protect, adminOnly, validate(expenseSchema), updateExpense)
  .delete(protect, adminOnly, deleteExpense);

export default router;
