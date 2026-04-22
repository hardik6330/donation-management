import { Category, Donation, sequelize } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { findOrCreateLocationStructure } from '../utils/locationHelper.js';
import { notFound, badRequest } from '../utils/httpError.js';

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

  if (country) {
    locationResult = await findOrCreateLocationStructure(country, state, city);
    if (locationResult) messages.push('Location structure updated/verified.');
  }

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

export const getCategories = asyncHandler(async (req, res) => {
  const { all, search } = req.query;
  const { page, limit, offset, isFetchAll, requestedFields } = getPaginationParams(req.query);

  const where = all === 'true' ? {} : { isActive: true };

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

  const response = getPaginatedResponse({ rows: categories, count, limit, page, isFetchAll });
  return sendSuccess(res, response, 'All categories records fetched successfully');
});

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

export const deleteCategoryMaster = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByPk(id);
  if (!category) throw notFound('Category');

  const donationsCount = await Donation.count({ where: { categoryId: id } });
  if (donationsCount > 0) {
    throw badRequest('Cannot delete category with linked donations. Please deactivate it instead.');
  }

  await category.destroy();
  return sendSuccess(res, null, 'Category deleted successfully');
});
