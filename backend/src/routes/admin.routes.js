import express from 'express';
import { getAdminStats, getAllDonationsAdmin } from '../controllers/adminController.js';
import { getDonors } from '../controllers/donationController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Protected admin routes
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/donations', protect, adminOnly, getAllDonationsAdmin);
router.get('/donors', protect, adminOnly, getDonors);

export default router;
