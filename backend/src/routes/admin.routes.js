import express from 'express';
import { getAdminStats, getAllDonationsAdmin } from '../controllers/adminController.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Only protected admin routes (we should ideally add an isAdmin middleware too)
router.get('/stats', protect, getAdminStats);
router.get('/donations', protect, getAllDonationsAdmin);

export default router;
