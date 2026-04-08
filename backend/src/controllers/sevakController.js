import { Sevak } from '../models/sevak.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';

// 1. Add New Sevak
export const addSevak = async (req, res) => {
  try {
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
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 'Sevak with this mobile number already exists', 400);
    }
    return sendError(res, 'Failed to add sevak', 500, error);
  }
};

// 2. Get All Sevaks with Filters
export const getAllSevaks = async (req, res) => {
  try {
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
    return sendSuccess(res, response, 'Sevaks fetched successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch sevaks', 500, error);
  }
};

// 3. Get Single Sevak
export const getSevakById = async (req, res) => {
  try {
    const { id } = req.params;
    const sevak = await Sevak.findByPk(id);
    if (!sevak) {
      return sendError(res, 'Sevak not found', 404);
    }
    return sendSuccess(res, sevak, 'Sevak details fetched successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch sevak', 500, error);
  }
};

// 4. Update Sevak
export const updateSevak = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const sevak = await Sevak.findByPk(id);
    if (!sevak) {
      return sendError(res, 'Sevak not found', 404);
    }

    await sevak.update(updateData);
    return sendSuccess(res, sevak, 'Sevak updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update sevak', 500, error);
  }
};

// 5. Delete Sevak
export const deleteSevak = async (req, res) => {
  try {
    const { id } = req.params;
    const sevak = await Sevak.findByPk(id);
    
    if (!sevak) {
      return sendError(res, 'Sevak not found', 404);
    }

    await sevak.destroy();
    return sendSuccess(res, null, 'Sevak deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete sevak', 500, error);
  }
};
