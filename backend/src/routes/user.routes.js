import express from 'express';
import {
  createUser, loginUser, logoutUser, getUsers, getUserByMobile, getUserById,
  getSystemUsers, addSystemUser, updateSystemUser, deleteSystemUser
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { authRouteLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../validators/validate.js';
import { loginSchema, registerSchema, systemUserSchema } from '../validators/auth.validator.js';

const router = express.Router();

router.post('/register', authRouteLimiter, validate(registerSchema), createUser);
router.post('/login', authRouteLimiter, validate(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/mobile/:mobileNumber', getUserByMobile);
router.get('/', protect, getUsers);

// System User Management (Admin only)
router.get('/system', protect, adminOnly, getSystemUsers);
router.post('/system', protect, adminOnly, validate(systemUserSchema), addSystemUser);
router.put('/system/:id', protect, adminOnly, updateSystemUser);
router.delete('/system/:id', protect, adminOnly, deleteSystemUser);

router.get('/:id', protect, getUserById);

export default router;
