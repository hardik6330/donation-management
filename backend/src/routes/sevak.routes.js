import express from 'express';
import { 
  addSevak, 
  getAllSevaks, 
  getSevakById, 
  updateSevak, 
  deleteSevak 
} from '../controllers/sevakController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, addSevak)
  .get(protect, adminOnly, getAllSevaks);

router.route('/:id')
  .get(protect, adminOnly, getSevakById)
  .put(protect, adminOnly, updateSevak)
  .delete(protect, adminOnly, deleteSevak);

export default router;
