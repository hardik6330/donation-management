import { Location, Donation, sequelize } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { findOrCreateLocationStructure, formatName } from '../utils/locationHelper.js';
import { notFound, badRequest } from '../utils/httpError.js';
import { locationParentInclude } from '../utils/queryBuilder.js';

export const addLocationMaster = asyncHandler(async (req, res) => {
  const { country, state, city } = req.body;
  const lastLocation = await findOrCreateLocationStructure(country, state, city);

  if (!lastLocation) {
    throw badRequest('Country name is required');
  }

  return sendSuccess(res, lastLocation, 'Location structure saved successfully');
});

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

  const response = getPaginatedResponse({ rows: cities, count, limit, page, isFetchAll });
  return sendSuccess(res, response, 'All cities records fetched successfully');
});

export const getAllStates = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { page, limit, offset, isFetchAll } = getPaginationParams(req.query);

  const where = { type: 'state' };
  if (search && search.trim() !== '') {
    where.name = { [Op.like]: `%${search}%` };
  }

  const { count, rows } = await Location.findAndCountAll({
    where,
    include: [locationParentInclude(1)],
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

export const getAllCities = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { page, limit, offset, isFetchAll } = getPaginationParams(req.query);

  const where = { type: 'city' };
  if (search && search.trim() !== '') {
    where.name = { [Op.like]: `%${search}%` };
  }

  const { count, rows } = await Location.findAndCountAll({
    where,
    include: [locationParentInclude(2)],
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

  const response = getPaginatedResponse({ rows: formattedCities, count, limit, page, isFetchAll });
  return sendSuccess(res, response, 'All cities fetched successfully');
});

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

  const response = getPaginatedResponse({ rows: locations, count, limit, page, isFetchAll });
  return sendSuccess(res, response, 'All sub-locations records fetched successfully');
});

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

export const deleteLocationMaster = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const location = await Location.findByPk(id);
  if (!location) throw notFound('Location');

  const transaction = await sequelize.transaction();
  try {
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
