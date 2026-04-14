import express from 'express';
import { getKathas, addKatha, updateKatha, deleteKatha } from '../controllers/kathaController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../utils/validators/validate.js';
import { kathaSchema } from '../utils/validators/katha.validator.js';

const router = express.Router();

router.get('/all', getKathas);
router.post('/add', protect, adminOnly, validate(kathaSchema), addKatha);
router.put('/:id', protect, adminOnly, validate(kathaSchema), updateKatha);
router.delete('/:id', protect, adminOnly, deleteKatha);

export default router;
