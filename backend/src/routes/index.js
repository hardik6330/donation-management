import express from 'express';
import userRoutes from './user.routes.js';
import donationRoutes from './donation.routes.js';
import adminRoutes from './admin.routes.js';
import masterRoutes from './master.routes.js';
import gaushalaRoutes from './gaushala.routes.js';
import kathaRoutes from './katha.routes.js';
import bapuRoutes from './bapu.routes.js';
import expenseRoutes from './expense.routes.js';
import sevakRoutes from './sevak.routes.js';
import mandalRoutes from './mandal.routes.js';
import kartalDhunRoutes from './kartalDhun.routes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/donations', donationRoutes);
router.use('/admin', adminRoutes);
router.use('/master', masterRoutes);
router.use('/gaushala', gaushalaRoutes);
router.use('/katha', kathaRoutes);
router.use('/bapu', bapuRoutes);
router.use('/expenses', expenseRoutes);
router.use('/sevak', sevakRoutes);
router.use('/mandal', mandalRoutes);
router.use('/kartal-dhun', kartalDhunRoutes);

export default router;
