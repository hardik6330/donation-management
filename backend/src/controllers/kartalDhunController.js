import { KartalDhun, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { findOrCreateLocationStructure, extractLocationHierarchy, buildLocationFilter, formatLocationAddress } from '../utils/locationHelper.js';
import { notFound, badRequest } from '../utils/httpError.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { Op } from 'sequelize';

export const addKartalDhun = asyncHandler(async (req, res) => {
  const { name, date, amount, locationId, city, state, country, description } = req.body;

  let finalLocationId = locationId;
  if (country) {
    const location = await findOrCreateLocationStructure(country, state, city);
    if (location) finalLocationId = location.id;
  }

  const record = await KartalDhun.create({
    name, date, amount, locationId: finalLocationId, description
  });

  return sendSuccess(res, record, 'Kartal Dhun income added successfully', 201);
});

export const getAllKartalDhun = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { search, startDate, endDate, city, state, country } = req.query;

  const activeScopes = [];
  if (search) activeScopes.push({ method: ['search', search] });
  if (startDate || endDate) activeScopes.push({ method: ['dateRange', startDate, endDate] });
  if (city || state || country) activeScopes.push({ method: ['location', city, state, country] });

  const { count, rows } = await KartalDhun.scope(activeScopes).findAndCountAll({
    include: [{
      model: Location,
      as: 'location',
      attributes: ['id', 'name', 'type'],
      include: [{
        model: Location,
        as: 'parent',
        attributes: ['id', 'name', 'type'],
        include: [{
          model: Location,
          as: 'parent',
          attributes: ['id', 'name', 'type']
        }]
      }]
    }],
    order: [['date', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });

  const formattedRows = rows.map(r => {
    const record = r.toJSON();
    const { country, state, city } = extractLocationHierarchy(record.location);
    return { 
      ...record, 
      city, 
      state, 
      country,
      fullLocation: formatLocationAddress(record.location)
    };
  });

  const response = getPaginatedResponse({ rows: formattedRows, count, limit, page });
  return sendSuccess(res, response, 'All kartal dhun records fetched successfully');
});

export const updateKartalDhun = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await KartalDhun.findByPk(id);
  if (!record) throw notFound('Record');

  const { city, state, country, locationId, ...rest } = req.body;
  let finalLocationId = locationId;
  if (country) {
    const location = await findOrCreateLocationStructure(country, state, city);
    if (location) finalLocationId = location.id;
  }

  await record.update({ ...rest, locationId: finalLocationId });
  return sendSuccess(res, record, 'Record updated successfully');
});

export const deleteKartalDhun = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await KartalDhun.findByPk(id);
  if (!record) throw notFound('Record');

  await record.destroy();
  return sendSuccess(res, null, 'Record deleted successfully');
});
