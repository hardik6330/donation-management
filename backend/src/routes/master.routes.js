import express from 'express';
import { 
  addLocationMaster, 
  addCategoryMaster, 
  getCities, 
  getSubLocations, 
  getCategories,
  addCombinedMasterData,
  updateCategoryMaster
} from '../controllers/masterController.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

// --- Public/User Routes (For Donation Form) ---
router.get('/cities', getCities);
router.get('/sub-locations/:parentId', getSubLocations);
router.get('/categories', getCategories);

// --- Admin Only Protected Routes ---
router.post('/location', protect, adminOnly, addLocationMaster);
router.post('/category', protect, adminOnly, addCategoryMaster);
router.post('/combined', protect, adminOnly, addCombinedMasterData);
router.put('/category/:id', protect, adminOnly, updateCategoryMaster);

export default router;
