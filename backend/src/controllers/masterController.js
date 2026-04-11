import { Location, Category, Gaushala, Katha, Donation, sequelize } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';

// --- MASTER DATA MANAGEMENT (ADMIN) ---

// 1. Smart Save Location (City -> Taluka -> Village)
export const addLocationMaster = asyncHandler(async (req, res) => {
  const { city, taluka, village } = req.body;
  const lastLocation = await findOrCreateLocationStructure(city, taluka, village);
  
  if (!lastLocation) {
    const error = new Error('City name is required');
    error.statusCode = 400;
    throw error;
  }

  return sendSuccess(res, lastLocation, 'Location structure saved successfully');
});

// 2. Add/Update Category
export const addCategoryMaster = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;
  const category = await Category.create({ name, description, isActive });
  return sendSuccess(res, category, 'Category created successfully');
});

export const addCombinedMasterData = asyncHandler(async (req, res) => {
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
});

// --- DATA FETCHING (PUBLIC/ADMIN) ---

// 3. Get all cities
export const getCities = asyncHandler(async (req, res) => {
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
});

// 4. Get children by parentId (Talukas by City, or Villages by Taluka)
export const getSubLocations = asyncHandler(async (req, res) => {
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
});

// 5. Get all categories
export const getCategories = asyncHandler(async (req, res) => {
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
});

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

