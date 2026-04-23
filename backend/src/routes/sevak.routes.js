import express from 'express';
import {
  addSevak,
  getAllSevaks,
  getSevakById,
  updateSevak,
  deleteSevak,
  getSevakByMobile
} from '../controllers/sevakController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../validators/validate.js';
import { sevakSchema } from '../validators/sevak.validator.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, validate(sevakSchema), addSevak)
  .get(protect, adminOnly, getAllSevaks);

router.get('/mobile/:mobileNumber', protect, adminOnly, getSevakByMobile);

router.route('/:id')
  .get(protect, adminOnly, getSevakById)
  .put(protect, adminOnly, validate(sevakSchema), updateSevak)
  .delete(protect, adminOnly, deleteSevak);

export default router;
