import express from 'express';
import {
  addMandal, getAllMandals, updateMandal, deleteMandal,
  addMember, getAllMembers, updateMember, deleteMember
} from '../controllers/mandalController.js';
import {
  generateMonthlyPayments, getMonthlyPayments, updatePayment, getMonthlyReport
} from '../controllers/mandalPaymentController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Mandal (group) CRUD
router.route('/')
  .post(protect, adminOnly, addMandal)
  .get(protect, adminOnly, getAllMandals);

router.route('/:id')
  .put(protect, adminOnly, updateMandal)
  .delete(protect, adminOnly, deleteMandal);

// Member CRUD
router.route('/members')
  .post(protect, adminOnly, addMember)
  .get(protect, adminOnly, getAllMembers);

router.route('/members/:id')
  .put(protect, adminOnly, updateMember)
  .delete(protect, adminOnly, deleteMember);

// Payment endpoints
router.post('/payments/generate', protect, adminOnly, generateMonthlyPayments);
router.get('/payments/report', protect, adminOnly, getMonthlyReport);
router.get('/payments', protect, adminOnly, getMonthlyPayments);
router.put('/payments/:id', protect, adminOnly, updatePayment);

export default router;
