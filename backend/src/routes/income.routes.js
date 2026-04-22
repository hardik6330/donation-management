import express from 'express';
import { 
  addIncome, 
  getAllIncome, 
  updateIncome, 
  deleteIncome,
  getIncomeStats 
} from '../controllers/incomeController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../validators/validate.js';
import { incomeSchema } from '../validators/income.validator.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, validate(incomeSchema), addIncome)
  .get(protect, adminOnly, getAllIncome);

router.get('/stats', protect, adminOnly, getIncomeStats);

router.route('/:id')
  .put(protect, adminOnly, validate(incomeSchema), updateIncome)
  .delete(protect, adminOnly, deleteIncome);

export default router;
