import { Sevak } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';

// 1. Add New Sevak
export const addSevak = asyncHandler(async (req, res) => {
  const { name, mobileNumber, email, address, city, state, country } = req.body;

  const sevak = await Sevak.create({
    name,
    mobileNumber,
    email,
    address,
    city,
    state,
    country
  });

  return sendSuccess(res, sevak, 'Sevak added successfully', 201);
});

// 2. Get All Sevaks with Filters
export const getAllSevaks = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { search, city, state, isActive } = req.query;

  const where = {};

  if (search && search.trim() !== '') {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { mobileNumber: { [Op.like]: `%${search}%` } }
    ];
  }

  if (city && city.trim() !== '') {
    where.city = { [Op.like]: `%${city}%` };
  }

  if (state && state.trim() !== '') {
    where.state = { [Op.like]: `%${state}%` };
  }

  if (isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true';
  }

  const { count, rows } = await Sevak.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset: (page - 1) * limit
  });

  const response = getPaginatedResponse({ rows, count, limit, page, dataKey: 'rows' });
  return sendSuccess(res, response, 'All sevaks records fetched successfully');
});

// 3. Get Single Sevak
export const getSevakById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sevak = await Sevak.findByPk(id);
  if (!sevak) {
    const error = new Error('Sevak not found');
    error.statusCode = 404;
    throw error;
  }
  return sendSuccess(res, sevak, 'Sevak details fetched successfully');
});

// 4. Update Sevak
export const updateSevak = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const sevak = await Sevak.findByPk(id);
  if (!sevak) {
    const error = new Error('Sevak not found');
    error.statusCode = 404;
    throw error;
  }

  await sevak.update(updateData);
  return sendSuccess(res, sevak, 'Sevak updated successfully');
});

// 5. Delete Sevak
export const deleteSevak = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sevak = await Sevak.findByPk(id);
  
  if (!sevak) {
    const error = new Error('Sevak not found');
    error.statusCode = 404;
    throw error;
  }

  await sevak.destroy();
  return sendSuccess(res, null, 'Sevak deleted successfully');
});
