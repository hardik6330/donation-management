import { Location, Category, Gaushala, Katha, Donation, sequelize } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { findOrCreateLocationStructure, formatName } from '../utils/locationHelper.js';
import { notFound, badRequest } from '../utils/httpError.js';

// --- MASTER DATA MANAGEMENT (ADMIN) ---

// 1. Smart Save Location (Country -> State -> City)
export const addLocationMaster = asyncHandler(async (req, res) => {
  const { country, state, city } = req.body;
  const lastLocation = await findOrCreateLocationStructure(country, state, city);

  if (!lastLocation) {
    throw badRequest('Country name is required');
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
  const { country, state, city, categoryName, categoryDescription, isActive } = req.body;

  let locationResult = null;
  let categoryResult = null;
  let messages = [];

  // Handle Location if provided
  if (country) {
    locationResult = await findOrCreateLocationStructure(country, state, city);
    if (locationResult) messages.push('Location structure updated/verified.');
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

  const activeScopes = [{ method: ['type', 'city'] }, { method: ['search', search] }];

  const { count, rows: cities } = await Location.scope(activeScopes).findAndCountAll({
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
  });

  return sendSuccess(res, response, 'All cities records fetched successfully');
});

// 3b. Get all states (type: 'state') with parent (country)
export const getAllStates = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { page, limit, offset, isFetchAll } = getPaginationParams(req.query);

  const where = { type: 'state' };
  if (search && search.trim() !== '') {
    where.name = { [Op.like]: `%${search}%` };
  }

  const { count, rows } = await Location.findAndCountAll({
    where,
    include: [{
      model: Location,
      as: 'parent',
      attributes: ['id', 'name', 'type']
    }],
    order: [['name', 'ASC']],
    limit: isFetchAll ? undefined : limit,
    offset: isFetchAll ? undefined : offset
  });

  const formatted = rows.map(s => {
    const state = s.toJSON();
    return {
      id: state.id,
      name: state.name,
      type: state.type,
      countryId: state.parent?.id || null,
      countryName: state.parent?.name || null,
    };
  });

  const response = getPaginatedResponse({ rows: formatted, count, limit, page, isFetchAll });
  return sendSuccess(res, response, 'All states fetched successfully');
});

// 3c. Get all countries (type: 'country')
export const getAllCountries = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { page, limit, offset, isFetchAll } = getPaginationParams(req.query);

  const where = { type: 'country' };
  if (search && search.trim() !== '') {
    where.name = { [Op.like]: `%${search}%` };
  }

  const { count, rows } = await Location.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit: isFetchAll ? undefined : limit,
    offset: isFetchAll ? undefined : offset
  });

  const response = getPaginatedResponse({ rows, count, limit, page, isFetchAll });
  return sendSuccess(res, response, 'All countries fetched successfully');
});

// 3d. Get all cities (type: 'city') with parent hierarchy (state > country)
export const getAllCities = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { page, limit, offset, isFetchAll } = getPaginationParams(req.query);

  const where = { type: 'city' };
  if (search && search.trim() !== '') {
    where.name = { [Op.like]: `%${search}%` };
  }

  const { count, rows } = await Location.findAndCountAll({
    where,
    include: [{
      model: Location,
      as: 'parent',
      attributes: ['id', 'name', 'type'],
      include: [{
        model: Location,
        as: 'parent',
        attributes: ['id', 'name', 'type']
      }]
    }],
    order: [['name', 'ASC']],
    limit: isFetchAll ? undefined : limit,
    offset: isFetchAll ? undefined : offset
  });

  const formattedCities = rows.map(city => {
    const c = city.toJSON();
    return {
      id: c.id,
      name: c.name,
      type: c.type,
      stateId: c.parent?.id || null,
      stateName: c.parent?.name || null,
      countryId: c.parent?.parent?.id || null,
      countryName: c.parent?.parent?.name || null,
    };
  });

  const response = getPaginatedResponse({
    rows: formattedCities,
    count,
    limit,
    page,
    isFetchAll,
  });

  return sendSuccess(res, response, 'All cities fetched successfully');
});

// 4. Get children by parentId (States by Country, or Cities by State)
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
  });

  return sendSuccess(res, response, 'All categories records fetched successfully');
});

// 6. Update Category (Admin)
export const updateCategoryMaster = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  const category = await Category.findByPk(id);
  if (!category) throw notFound('Category');

  await category.update({
    name: name !== undefined ? name : category.name,
    description: description !== undefined ? description : category.description,
    isActive: isActive !== undefined ? isActive : category.isActive,
  });

  return sendSuccess(res, category, 'Category updated successfully');
});

// 7. Delete Category (Admin)
export const deleteCategoryMaster = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) throw notFound('Category');

  // Check if any donations are linked to this category
  const donationsCount = await Donation.count({ where: { categoryId: id } });
  if (donationsCount > 0) {
    throw badRequest('Cannot delete category with linked donations. Please deactivate it instead.');
  }

  await category.destroy();
  return sendSuccess(res, null, 'Category deleted successfully');
});

// 8. Update Location (Admin)
export const updateLocationMaster = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, isActive } = req.body;

  const location = await Location.findByPk(id);
  if (!location) throw notFound('Location');

  await location.update({
    name: name !== undefined ? formatName(name) : location.name,
    isActive: isActive !== undefined ? isActive : location.isActive,
  });

  return sendSuccess(res, location, 'Location updated successfully');
});

// 9. Delete Location (Admin)
export const deleteLocationMaster = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const location = await Location.findByPk(id);
  if (!location) throw notFound('Location');

  const transaction = await sequelize.transaction();
  try {
    // 1. Recursive check for linked donations in this location and all its sub-locations
    const getAllChildIds = async (parentId) => {
      let ids = [parentId];
      const children = await Location.findAll({ where: { parentId } });
      for (const child of children) {
        const childIds = await getAllChildIds(child.id);
        ids = [...ids, ...childIds];
      }
      return ids;
    };

    const allAffectedLocationIds = await getAllChildIds(id);

    // Check if any donations are linked to any of these locations
    const donationsCount = await Donation.count({ 
      where: { locationId: { [Op.in]: allAffectedLocationIds } } 
    });

    if (donationsCount > 0) {
      await transaction.rollback();
      throw badRequest('Cannot delete location or its sub-locations because they have linked donations. Please deactivate them instead.');
    }

    // 2. Delete all locations in the affected list
    await Location.destroy({ 
      where: { id: { [Op.in]: allAffectedLocationIds } },
      transaction 
    });

    await transaction.commit();
    return sendSuccess(res, null, 'Location and all its sub-locations deleted successfully');
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
});

