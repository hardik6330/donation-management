import express from 'express';
import { getBapuSchedules, addBapuSchedule, updateBapuSchedule, deleteBapuSchedule } from '../controllers/bapuController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validate.js';
import { bapuScheduleSchema } from '../validators/bapu.validator.js';

const router = express.Router();

router.get('/all', getBapuSchedules);
router.post('/add', protect, adminOnly, validate(bapuScheduleSchema), addBapuSchedule);
router.put('/:id', protect, adminOnly, validate(bapuScheduleSchema), updateBapuSchedule);
router.delete('/:id', protect, adminOnly, deleteBapuSchedule);

export default router;
