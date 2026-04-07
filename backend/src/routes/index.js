import express from 'express';
import userRoutes from './user.routes.js';
import donationRoutes from './donation.routes.js';
import adminRoutes from './admin.routes.js';
import masterRoutes from './master.routes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/donations', donationRoutes);
router.use('/admin', adminRoutes);
router.use('/master', masterRoutes);

export default router;
