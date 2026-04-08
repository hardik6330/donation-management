import express from 'express';
import { getKathas, addKatha } from '../controllers/kathaController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/all', getKathas);
router.post('/add', protect, adminOnly, addKatha);

export default router;
