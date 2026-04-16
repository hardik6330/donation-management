import express from 'express';
import {
  addLocationMaster,
  addCategoryMaster,
  getCategories,
  addCombinedMasterData,
  updateCategoryMaster,
  deleteCategoryMaster,
  updateLocationMaster,
  deleteLocationMaster,
  getCities,
  getAllCities,
  getAllStates,
  getAllCountries,
  getSubLocations
} from '../controllers/masterController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { validate } from '../utils/validators/validate.js';
import { locationSchema, categorySchema, combinedMasterSchema } from '../utils/validators/master.validator.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/cities', getCities);
router.get('/all-cities', getAllCities);
router.get('/all-states', getAllStates);
router.get('/all-countries', getAllCountries);
router.get('/sub-locations/:parentId', getSubLocations);

// --- Admin Only Protected Routes ---
router.post('/location', protect, adminOnly, validate(locationSchema), addLocationMaster);
router.post('/category', protect, adminOnly, validate(categorySchema), addCategoryMaster);
router.post('/combined', protect, adminOnly, validate(combinedMasterSchema), addCombinedMasterData);
router.put('/category/:id', protect, adminOnly, validate(categorySchema), updateCategoryMaster);
router.delete('/category/:id', protect, adminOnly, deleteCategoryMaster);
router.put('/location/:id', protect, adminOnly, updateLocationMaster);
router.delete('/location/:id', protect, adminOnly, deleteLocationMaster);

export default router;
