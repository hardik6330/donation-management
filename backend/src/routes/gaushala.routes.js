import express from 'express';
import { getGaushalas, addGaushala, updateGaushala, deleteGaushala } from '../controllers/gaushalaController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../validators/validate.js';
import { gaushalaSchema } from '../validators/gaushala.validator.js';

const router = express.Router();

router.get('/all', getGaushalas);
router.post('/add', protect, adminOnly, validate(gaushalaSchema), addGaushala);
router.put('/:id', protect, adminOnly, validate(gaushalaSchema), updateGaushala);
router.delete('/:id', protect, adminOnly, deleteGaushala);

export default router;
