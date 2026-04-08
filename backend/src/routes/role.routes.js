import express from 'express';
import { getAllRoles, addRole, updateRole, deleteRole } from '../controllers/roleController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, adminOnly, getAllRoles)
  .post(protect, adminOnly, addRole);

router.route('/:id')
  .put(protect, adminOnly, updateRole)
  .delete(protect, adminOnly, deleteRole);

export default router;
