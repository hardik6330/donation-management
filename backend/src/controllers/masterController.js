import { Location } from '../models/location.js';
import { Category } from '../models/category.js';
import { Gaushala } from '../models/gaushala.js';
import { Katha } from '../models/katha.js';
import { Donation } from '../models/donation.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { sequelize } from '../config/db.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';

// --- MASTER DATA MANAGEMENT (ADMIN) ---

// 1. Smart Save Location (City -> Taluka -> Village)
export const addLocationMaster = async (req, res) => {
  try {
    const { city, taluka, village } = req.body;
    const lastLocation = await findOrCreateLocationStructure(city, taluka, village);
    
    if (!lastLocation) return sendError(res, 'City name is required', 400);

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
    const { search } = req.query;
    const { page, limit, offset, isFetchAll, requestedFields } = getPaginationParams(req.query);

    const where = { type: 'city' };
    if (search && search.trim() !== '') {
      where.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows: cities } = await Location.findAndCountAll({
      where,
      attributes: requestedFields || undefined,
      order: [['name', 'ASC']],
      limit: isFetchAll ? undefined : limit,
      offset: isFetchAll ? undefined : offset
    });

    const response = getPaginatedResponse({
      rows: cities,
      count,
      limit,
      page,
      isFetchAll,
      dataKey: 'data'
    });

    return sendSuccess(res, response, 'All cities records fetched successfully');
  } catch (error) {
    console.error('❌ [getCities] Error:', error);
    return sendError(res, 'Error fetching cities', 500);
  }
};

// 4. Get children by parentId (Talukas by City, or Villages by Taluka)
export const getSubLocations = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { search } = req.query;
    const { page, limit, offset, isFetchAll, requestedFields } = getPaginationParams(req.query);

    const where = { parentId };
    if (search && search.trim() !== '') {
      where.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows: locations } = await Location.findAndCountAll({
      where,
      attributes: requestedFields || undefined,
      order: [['name', 'ASC']],
      limit: isFetchAll ? undefined : limit,
      offset: isFetchAll ? undefined : offset
    });

    const response = getPaginatedResponse({
      rows: locations,
      count,
      limit,
      page,
      isFetchAll,
      dataKey: 'data'
    });

    return sendSuccess(res, response, 'All sub-locations records fetched successfully');
  } catch (error) {
    console.error('❌ [getSubLocations] Error:', error);
    return sendError(res, 'Error fetching sub-locations', 500);
  }
};

// 5. Get all categories
export const getCategories = async (req, res) => {
  try {
    const { all, search } = req.query;
    const { page, limit, offset, isFetchAll, requestedFields } = getPaginationParams(req.query);

    const where = all === 'true' ? {} : { isActive: true };
    
    // Add search filter if provided
    if (search && search.trim() !== '') {
      where.name = { [Op.like]: `%${search}%` };
    }

    const attributes = requestedFields ? requestedFields : {
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
    };

    const { count, rows: categories } = await Category.findAndCountAll({
      where,
      attributes,
      order: [['name', 'ASC']],
      limit: isFetchAll ? undefined : limit,
      offset: isFetchAll ? undefined : offset
    });

    const response = getPaginatedResponse({
      rows: categories,
      count,
      limit,
      page,
      isFetchAll,
      dataKey: 'data'
    });
    
    return sendSuccess(res, response, 'All categories records fetched successfully');
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

// 7. Delete Category (Admin)
export const deleteCategoryMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) return sendError(res, 'Category not found', 404);

    // Check if any donations are linked to this category
    const donationsCount = await Donation.count({ where: { categoryId: id } });
    if (donationsCount > 0) {
      return sendError(res, 'Cannot delete category with linked donations. Please deactivate it instead.', 400);
    }

    await category.destroy();
    return sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    return sendError(res, 'Error deleting category', 500, error);
  }
};

// 8. Update Location (Admin)
export const updateLocationMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const location = await Location.findByPk(id);
    if (!location) return sendError(res, 'Location not found', 404);

    await location.update({
      name: name !== undefined ? formatName(name) : location.name,
      isActive: isActive !== undefined ? isActive : location.isActive,
    });

    return sendSuccess(res, location, 'Location updated successfully');
  } catch (error) {
    return sendError(res, 'Error updating location', 500, error);
  }
};

// 9. Delete Location (Admin)
export const deleteLocationMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);
    if (!location) return sendError(res, 'Location not found', 404);

    // Check if any sub-locations are linked to this location
    const subLocationsCount = await Location.count({ where: { parentId: id } });
    if (subLocationsCount > 0) {
      return sendError(res, 'Cannot delete location with sub-locations (talukas/villages).', 400);
    }

    // Check if any donations are linked to this location
    const donationsCount = await Donation.count({ where: { locationId: id } });
    if (donationsCount > 0) {
      return sendError(res, 'Cannot delete location with linked donations. Please deactivate it instead.', 400);
    }

    await location.destroy();
    return sendSuccess(res, null, 'Location deleted successfully');
  } catch (error) {
    return sendError(res, 'Error deleting location', 500, error);
  }
};

