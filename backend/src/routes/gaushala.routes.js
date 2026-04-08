import express from 'express';
import { getGaushalas, addGaushala } from '../controllers/gaushalaController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/all', getGaushalas);
router.post('/add', protect, adminOnly, addGaushala);

export default router;
