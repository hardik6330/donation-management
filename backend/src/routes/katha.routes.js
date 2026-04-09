import express from 'express';
import { getKathas, addKatha, updateKatha, deleteKatha } from '../controllers/kathaController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/all', getKathas);
router.post('/add', protect, adminOnly, addKatha);
router.put('/:id', protect, adminOnly, updateKatha);
router.delete('/:id', protect, adminOnly, deleteKatha);

export default router;
