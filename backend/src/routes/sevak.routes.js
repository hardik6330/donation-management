import express from 'express';
import { 
  addSevak, 
  getAllSevaks, 
  getSevakById, 
  updateSevak, 
  deleteSevak 
} from '../controllers/sevakController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../utils/validators/validate.js';
import { sevakSchema } from '../utils/validators/sevak.validator.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, validate(sevakSchema), addSevak)
  .get(protect, adminOnly, getAllSevaks);

router.route('/:id')
  .get(protect, adminOnly, getSevakById)
  .put(protect, adminOnly, validate(sevakSchema), updateSevak)
  .delete(protect, adminOnly, deleteSevak);

export default router;
