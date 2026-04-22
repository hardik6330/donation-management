import express from 'express';
import {
  addMandal, getAllMandals, updateMandal, deleteMandal,
  addMember, getAllMembers, updateMember, deleteMember
} from '../controllers/mandalController.js';
import {
  generateMonthlyPayments, getMonthlyPayments, updatePayment, getMonthlyReport
} from '../controllers/mandalPaymentController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../validators/validate.js';
import { mandalSchema, mandalMemberSchema, generatePaymentSchema } from '../validators/mandal.validator.js';

const router = express.Router();

// Mandal (group) CRUD
router.route('/')
  .post(protect, adminOnly, validate(mandalSchema), addMandal)
  .get(protect, adminOnly, getAllMandals);

router.route('/:id')
  .put(protect, adminOnly, validate(mandalSchema), updateMandal)
  .delete(protect, adminOnly, deleteMandal);

// Member CRUD
router.route('/members')
  .post(protect, adminOnly, validate(mandalMemberSchema), addMember)
  .get(protect, adminOnly, getAllMembers);

router.route('/members/:id')
  .put(protect, adminOnly, validate(mandalMemberSchema), updateMember)
  .delete(protect, adminOnly, deleteMember);

// Payment endpoints
router.post('/payments/generate', protect, adminOnly, validate(generatePaymentSchema), generateMonthlyPayments);
router.get('/payments/report', protect, adminOnly, getMonthlyReport);
router.get('/payments', protect, adminOnly, getMonthlyPayments);
router.put('/payments/:id', protect, adminOnly, updatePayment);

export default router;
