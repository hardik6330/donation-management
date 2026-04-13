import { Katha, Donation, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { findOrCreateLocationStructure, buildLocationFilter, extractLocationHierarchy, formatLocationAddress } from '../utils/locationHelper.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op, fn, col } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound, badRequest } from '../utils/httpError.js';

export const getKathas = asyncHandler(async (req, res) => {
  const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
  const { status, locationId, search } = req.query;
  const where = {};
  if (status) where.status = status;

  if (search && search.trim() !== '') {
    where.name = { [Op.like]: `%${search}%` };
  }

  if (locationId) {
    const locationFilter = await buildLocationFilter(null, null, null, locationId);
    if (locationFilter) where.locationId = locationFilter;
  }

  // If only specific fields are requested (e.g. id, name), avoid complex logic
  if (requestedFields) {
    const { count, rows } = await Katha.findAndCountAll({
      where,
      attributes: requestedFields,
      order: [['name', 'ASC']],
      limit: queryLimit,
      offset
    });
    const response = getPaginatedResponse({ rows, count, limit, page, isFetchAll, dataKey: 'rows' });
    return sendSuccess(res, response, 'Kathas records fetched successfully');
  }

  const { count, rows } = await Katha.findAndCountAll({
    where,
    include: [
      {
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
      },
      {
        model: Donation,
        attributes: [],
      }
    ],
    attributes: {
      include: [
        [fn('COUNT', col('Donations.id')), 'totalDonations'],
        [fn('COALESCE', fn('SUM', col('Donations.amount')), 0), 'totalDonationAmount']
      ]
    },
    group: ['Katha.id', 'location.id', 'location->parent.id', 'location->parent->parent.id'],
    order: [['createdAt', 'DESC']],
    limit: queryLimit,
    offset,
    subQuery: false
  });

  const formattedKathas = rows.map(k => {
    const katha = k.toJSON();
    const { city, taluka, village } = extractLocationHierarchy(katha.location);

    return {
      ...katha,
      city,
      taluka,
      village,
      fullLocation: formatLocationAddress(katha.location),
      totalDonations: parseInt(katha.totalDonations) || 0,
      totalDonationAmount: parseFloat(katha.totalDonationAmount) || 0
    };
  });

  // With GROUP BY, count is an array - use its length for total count
  const totalCount = Array.isArray(count) ? count.length : count;
  const response = getPaginatedResponse({ rows: formattedKathas, count: totalCount, limit, page, isFetchAll, dataKey: 'rows' });
  return sendSuccess(res, response, 'All kathas records fetched successfully');
});

export const addKatha = asyncHandler(async (req, res) => {
  const { name, city, taluka, village, locationId, startDate, endDate, status, description } = req.body;
  
  let finalLocationId = locationId;
  
  // If location names are provided, use findOrCreate logic
  if (city) {
    const location = await findOrCreateLocationStructure(city, taluka, village);
    if (location) finalLocationId = location.id;
  }

  if (!finalLocationId) {
    throw badRequest('Location is required');
  }

  const katha = await Katha.create({ 
    name, 
    locationId: finalLocationId, 
    startDate, 
    endDate, 
    status, 
    description 
  });
  
  return sendSuccess(res, katha, 'Katha added successfully');
});

export const updateKatha = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, city, taluka, village, locationId, startDate, endDate, status, description } = req.body;
  
  const katha = await Katha.findByPk(id);
  if (!katha) throw notFound('Katha');

  let finalLocationId = locationId || katha.locationId;
  if (city) {
    const location = await findOrCreateLocationStructure(city, taluka, village);
    if (location) finalLocationId = location.id;
  }

  await katha.update({ 
    name: name || katha.name, 
    locationId: finalLocationId, 
    startDate: startDate || katha.startDate, 
    endDate: endDate || katha.endDate, 
    status: status || katha.status, 
    description: description || katha.description 
  });
  
  return sendSuccess(res, katha, 'Katha updated successfully');
});

export const deleteKatha = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const katha = await Katha.findByPk(id);
  if (!katha) throw notFound('Katha');
  await katha.destroy();
  return sendSuccess(res, null, 'Katha deleted successfully');
});
