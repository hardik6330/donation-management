import express from 'express';
import {
  createUser, loginUser, logoutUser, getUsers, getUserByMobile,
  getSystemUsers, addSystemUser, updateSystemUser, deleteSystemUser
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validate.js';
import { loginSchema, registerSchema, systemUserSchema } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/register', validate(registerSchema), createUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/mobile/:mobileNumber', getUserByMobile);
router.get('/', protect, getUsers);

// System User Management (Admin only)
router.get('/system', protect, adminOnly, getSystemUsers);
router.post('/system', protect, adminOnly, validate(systemUserSchema), addSystemUser);
router.put('/system/:id', protect, adminOnly, updateSystemUser);
router.delete('/system/:id', protect, adminOnly, deleteSystemUser);

export default router;
