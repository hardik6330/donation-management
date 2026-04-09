import express from 'express';
import { getGaushalas, addGaushala, updateGaushala, deleteGaushala } from '../controllers/gaushalaController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/all', getGaushalas);
router.post('/add', protect, adminOnly, addGaushala);
router.put('/:id', protect, adminOnly, updateGaushala);
router.delete('/:id', protect, adminOnly, deleteGaushala);

export default router;
