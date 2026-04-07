import { Location } from '../models/location.js';
import { Category } from '../models/category.js';
import { Donation } from '../models/donation.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { sequelize } from '../config/db.js';

// Helper to clean and format names
const formatName = (name) => {
  if (!name) return '';
  return name.trim().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// --- MASTER DATA MANAGEMENT (ADMIN) ---

// 1. Smart Save Location (City -> Taluka -> Village)
export const addLocationMaster = async (req, res) => {
  try {
    let { city, taluka, village } = req.body;
    
    if (!city) return sendError(res, 'City name is required', 400);

    // a. Handle City
    city = formatName(city);
    let [cityObj] = await Location.findOrCreate({
      where: { name: city, type: 'city', parentId: null }
    });

    let lastLocation = cityObj;

    // b. Handle Taluka (Optional)
    if (taluka) {
      taluka = formatName(taluka);
      let [talukaObj] = await Location.findOrCreate({
        where: { name: taluka, type: 'taluka', parentId: cityObj.id }
      });
      lastLocation = talukaObj;

      // c. Handle Village (Optional, only if taluka exists)
      if (village) {
        village = formatName(village);
        let [villageObj] = await Location.findOrCreate({
          where: { name: village, type: 'village', parentId: talukaObj.id }
        });
        lastLocation = villageObj;
      }
    }

    return sendSuccess(res, lastLocation, 'Location structure saved successfully');
  } catch (error) {
    return sendError(res, 'Error saving location', 500, error);
  }
};

// 2. Add/Update Category
export const addCategoryMaster = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.create({ name, description, isActive });
    return sendSuccess(res, category, 'Category created successfully');
  } catch (error) {
    return sendError(res, 'Error creating category', 500, error);
  }
};

export const addCombinedMasterData = async (req, res) => {
  try {
    const { city, taluka, village, categoryName, categoryDescription, isActive } = req.body;

    let locationResult = null;
    let categoryResult = null;
    let messages = [];

    // Handle Location if provided
    if (city) {
      let cityObj = await Location.findOne({ where: { name: city, type: 'city' } });
      if (!cityObj) {
        cityObj = await Location.create({ name: city, type: 'city' });
        messages.push(`City '${city}' created.`);
      }

      let parentId = cityObj.id;

      if (taluka) {
        let talukaObj = await Location.findOne({ where: { name: taluka, type: 'taluka', parentId } });
        if (!talukaObj) {
          talukaObj = await Location.create({ name: taluka, type: 'taluka', parentId });
          messages.push(`Taluka '${taluka}' created.`);
        }
        parentId = talukaObj.id;

        if (village) {
          let villageObj = await Location.findOne({ where: { name: village, type: 'village', parentId } });
          if (!villageObj) {
            villageObj = await Location.create({ name: village, type: 'village', parentId });
            messages.push(`Village '${village}' created.`);
          }
          locationResult = villageObj;
        } else {
          locationResult = talukaObj;
        }
      } else {
        locationResult = cityObj;
      }
    }

    // Handle Category if provided
    if (categoryName) {
      let existingCategory = await Category.findOne({ where: { name: categoryName } });
      if (!existingCategory) {
        categoryResult = await Category.create({ 
          name: categoryName, 
          description: categoryDescription, 
          isActive: isActive !== undefined ? isActive : true 
        });
        messages.push(`Category '${categoryName}' created.`);
      } else {
        messages.push(`Category '${categoryName}' already exists, skipped.`);
      }
    }

    if (messages.length === 0) {
      return sendSuccess(res, null, 'No new data to add.');
    }

    return sendSuccess(res, { location: locationResult, category: categoryResult }, messages.join(' '));
  } catch (error) {
    console.error('❌ [addCombinedMasterData] Error:', error);
    return sendError(res, 'Error adding master data', 500, error);
  }
};

// --- DATA FETCHING (PUBLIC/ADMIN) ---

// 3. Get all cities
export const getCities = async (req, res) => {
  try {
    const cities = await Location.findAll({ where: { type: 'city' }, order: [['name', 'ASC']] });
    return sendSuccess(res, cities);
  } catch (error) {
    return sendError(res, 'Error fetching cities', 500);
  }
};

// 4. Get children by parentId (Talukas by City, or Villages by Taluka)
export const getSubLocations = async (req, res) => {
  try {
    const { parentId } = req.params;
    const locations = await Location.findAll({ where: { parentId }, order: [['name', 'ASC']] });
    return sendSuccess(res, locations);
  } catch (error) {
    return sendError(res, 'Error fetching sub-locations', 500);
  }
};

// 5. Get all categories
export const getCategories = async (req, res) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? {} : { isActive: true };
    
    const categories = await Category.findAll({ 
      where, 
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(SUM(amount), 0)
              FROM Donations
              WHERE Donations.categoryId = Category.id AND Donations.status = 'completed'
            )`),
            'totalDonation'
          ]
        ]
      },
      order: [['name', 'ASC']] 
    });
    
    return sendSuccess(res, categories);
  } catch (error) {
    console.error('❌ [getCategories] Error:', error);
    return sendError(res, 'Error fetching categories', 500);
  }
};

// 6. Update Category (Admin)
export const updateCategoryMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findByPk(id);
    if (!category) return sendError(res, 'Category not found', 404);

    await category.update({
      name: name !== undefined ? name : category.name,
      description: description !== undefined ? description : category.description,
      isActive: isActive !== undefined ? isActive : category.isActive,
    });

    return sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    return sendError(res, 'Error updating category', 500, error);
  }
};
