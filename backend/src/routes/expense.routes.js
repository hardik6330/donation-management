import express from 'express';
import { 
  addExpense, 
  getAllExpenses, 
  updateExpense, 
  deleteExpense,
  getExpenseStats 
} from '../controllers/expenseController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, addExpense)
  .get(protect, adminOnly, getAllExpenses);

router.get('/stats', protect, adminOnly, getExpenseStats);

router.route('/:id')
  .put(protect, adminOnly, updateExpense)
  .delete(protect, adminOnly, deleteExpense);

export default router;
