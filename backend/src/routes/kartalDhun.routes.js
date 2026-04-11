import express from 'express';
import { addKartalDhun, getAllKartalDhun, updateKartalDhun, deleteKartalDhun } from '../controllers/kartalDhunController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validate.js';
import { kartalDhunSchema } from '../validators/kartalDhun.validator.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, validate(kartalDhunSchema), addKartalDhun)
  .get(protect, adminOnly, getAllKartalDhun);

router.route('/:id')
  .put(protect, adminOnly, updateKartalDhun)
  .delete(protect, adminOnly, deleteKartalDhun);

export default router;
