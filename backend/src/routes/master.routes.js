import express from 'express';
import {
  addLocationMaster,
  addCategoryMaster,
  getCategories,
  addCombinedMasterData,
  updateCategoryMaster,
  getCities,
  getSubLocations
} from '../controllers/masterController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/cities', getCities);
router.get('/sub-locations/:parentId', getSubLocations);

// --- Admin Only Protected Routes ---
router.post('/location', protect, adminOnly, addLocationMaster);
router.post('/category', protect, adminOnly, addCategoryMaster);
router.post('/combined', protect, adminOnly, addCombinedMasterData);
router.put('/category/:id', protect, adminOnly, updateCategoryMaster);

export default router;
