import express from 'express';
import { getAllRoles, addRole, updateRole, deleteRole } from '../controllers/roleController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../utils/validators/validate.js';
import { roleSchema } from '../utils/validators/role.validator.js';

const router = express.Router();

router.route('/')
  .get(protect, adminOnly, getAllRoles)
  .post(protect, adminOnly, validate(roleSchema), addRole);

router.route('/:id')
  .put(protect, adminOnly, validate(roleSchema), updateRole)
  .delete(protect, adminOnly, deleteRole);

export default router;
