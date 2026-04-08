import express from 'express';
import { addKartalDhun, getAllKartalDhun, updateKartalDhun, deleteKartalDhun } from '../controllers/kartalDhunController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, addKartalDhun)
  .get(protect, adminOnly, getAllKartalDhun);

router.route('/:id')
  .put(protect, adminOnly, updateKartalDhun)
  .delete(protect, adminOnly, deleteKartalDhun);

export default router;
