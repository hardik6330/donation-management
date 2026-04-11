import { Gaushala, Donation, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { findOrCreateLocationStructure, getAllSubLocationIds } from '../utils/locationHelper.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op, fn, col } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const getGaushalas = asyncHandler(async (req, res) => {
  const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
  const { locationId, search } = req.query;
  let where = {};

  if (search && search.trim() !== '') {
    where.name = { [Op.like]: `%${search}%` };
  }

  if (locationId) {
    const locationIds = await getAllSubLocationIds(locationId);
    where.locationId = { [Op.in]: locationIds };
  }

  // If only specific fields are requested (e.g. id, name), avoid complex logic
  if (requestedFields) {
    const { count, rows } = await Gaushala.findAndCountAll({
      where,
      attributes: requestedFields,
      order: [['name', 'ASC']],
      limit: queryLimit,
      offset
    });
    const response = getPaginatedResponse({ rows, count, limit, page, isFetchAll, dataKey: 'rows' });
    return sendSuccess(res, response, 'Gaushalas records fetched successfully');
  }

  const { count, rows } = await Gaushala.findAndCountAll({
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
    group: ['Gaushala.id', 'location.id', 'location->parent.id', 'location->parent->parent.id'],
    order: [['name', 'ASC']],
    limit: queryLimit,
    offset,
    subQuery: false
  });

  // Format the response to include city, taluka, village
  const formattedGaushalas = rows.map(g => {
    const gaushala = g.toJSON();
    let city = null, taluka = null, village = null;

    let current = gaushala.location;
    while (current) {
      if (current.type === 'city') city = current.name;
      if (current.type === 'taluka') taluka = current.name;
      if (current.type === 'village') village = current.name;
      current = current.parent;
    }

    return {
      ...gaushala,
      city,
      taluka,
      village,
      fullLocation: [village, taluka, city].filter(Boolean).join(', '),
      totalDonations: parseInt(gaushala.totalDonations) || 0,
      totalDonationAmount: parseFloat(gaushala.totalDonationAmount) || 0
    };
  });

  // With GROUP BY, count is an array - use its length for total count
  const totalCount = Array.isArray(count) ? count.length : count;
  const response = getPaginatedResponse({ rows: formattedGaushalas, count: totalCount, limit, page, isFetchAll, dataKey: 'rows' });
  return sendSuccess(res, response, 'All gaushalas records fetched successfully');
});

export const addGaushala = asyncHandler(async (req, res) => {
  const { name, city, taluka, village, locationId, isActive } = req.body;
  
  let finalLocationId = locationId;
  
  // If location names are provided, use findOrCreate logic
  if (city) {
    const location = await findOrCreateLocationStructure(city, taluka, village);
    if (location) finalLocationId = location.id;
  }

  if (!finalLocationId) {
    throw new Error('Location is required');
  }

  const gaushala = await Gaushala.create({ 
    name, 
    locationId: finalLocationId,
    isActive: isActive !== undefined ? isActive : true
  });
  
  return sendSuccess(res, gaushala, 'Gaushala added successfully');
});

export const updateGaushala = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, city, taluka, village, locationId, isActive } = req.body;
  
  const gaushala = await Gaushala.findByPk(id);
  if (!gaushala) {
    const error = new Error('Gaushala not found');
    error.statusCode = 404;
    throw error;
  }

  let finalLocationId = locationId || gaushala.locationId;
  if (city) {
    const location = await findOrCreateLocationStructure(city, taluka, village);
    if (location) finalLocationId = location.id;
  }

  await gaushala.update({ 
    name: name || gaushala.name, 
    locationId: finalLocationId,
    isActive: isActive !== undefined ? isActive : gaushala.isActive
  });
  
  return sendSuccess(res, gaushala, 'Gaushala updated successfully');
});

export const deleteGaushala = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const gaushala = await Gaushala.findByPk(id);
  if (!gaushala) {
    const error = new Error('Gaushala not found');
    error.statusCode = 404;
    throw error;
  }
  await gaushala.destroy();
  return sendSuccess(res, null, 'Gaushala deleted successfully');
});
