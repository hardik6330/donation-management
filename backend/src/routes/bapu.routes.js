import express from 'express';
import { getBapuSchedules, addBapuSchedule, updateBapuSchedule, deleteBapuSchedule } from '../controllers/bapuController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/all', getBapuSchedules);
router.post('/add', protect, adminOnly, addBapuSchedule);
router.put('/:id', protect, adminOnly, updateBapuSchedule);
router.delete('/:id', protect, adminOnly, deleteBapuSchedule);

export default router;
