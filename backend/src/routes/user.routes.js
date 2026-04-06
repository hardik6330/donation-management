import express from 'express';
import { createUser, loginUser, logoutUser, getUsers, getUserByMobile } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/mobile/:mobileNumber', getUserByMobile);
router.get('/', getUsers);

export default router;
