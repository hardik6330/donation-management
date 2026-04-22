import { Gaushala, Donation, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { findOrCreateLocationStructure, buildLocationFilter, extractLocationHierarchy, formatLocationAddress } from '../utils/locationHelper.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op, fn, col } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound, badRequest } from '../utils/httpError.js';
import { locationParentInclude } from '../utils/queryBuilder.js';
import { createCRUDController } from '../utils/createCRUDController.js';

const crud = createCRUDController({ Model: Gaushala, name: 'Gaushala' });

export const getGaushalas = asyncHandler(async (req, res) => {
  const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
  const { search, city, state, country } = req.query;
  
  const activeScopes = [
    { method: ['search', search] },
    { method: ['location', city, state, country] }
  ].filter(s => s !== null && s !== undefined);

  // If only specific fields are requested (e.g. id, name), avoid complex logic
  if (requestedFields) {
    const { count, rows } = await Gaushala.scope(activeScopes).findAndCountAll({
      attributes: requestedFields,
      order: [['name', 'ASC']],
      limit: queryLimit,
      offset
    });
    const response = getPaginatedResponse({ rows, count, limit, page, isFetchAll });
    return sendSuccess(res, response, 'Gaushalas records fetched successfully');
  }

  const { count, rows } = await Gaushala.scope(activeScopes).findAndCountAll({
    include: [
      {
        model: Location,
        as: 'location',
        attributes: ['id', 'name', 'type'],
        include: [locationParentInclude(2)]
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

  // Format the response to include country, state, city
  const formattedGaushalas = rows.map(g => {
    const gaushala = g.toJSON();
    const { country, state, city } = extractLocationHierarchy(gaushala.location);

    return {
      ...gaushala,
      country: country || null,
      state: state || null,
      city: city || null,
      fullLocation: formatLocationAddress(gaushala.location),
      totalDonations: parseInt(gaushala.totalDonations) || 0,
      totalDonationAmount: parseFloat(gaushala.totalDonationAmount) || 0
    };
  });

  // With GROUP BY, count is an array - use its length for total count
  const totalCount = Array.isArray(count) ? count.length : count;
  const response = getPaginatedResponse({ rows: formattedGaushalas, count: totalCount, limit, page, isFetchAll });
  return sendSuccess(res, response, 'All gaushalas records fetched successfully');
});

export const addGaushala = asyncHandler(async (req, res) => {
  const { name, country, state, city, locationId, isActive } = req.body;

  let finalLocationId = locationId;

  // If location names are provided, use findOrCreate logic
  if (country) {
    const location = await findOrCreateLocationStructure(country, state, city);
    if (location) finalLocationId = location.id;
  }

  if (!finalLocationId) {
    throw badRequest('Location is required');
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
  const { name, country, state, city, locationId, isActive } = req.body;

  const gaushala = await Gaushala.findByPk(id);
  if (!gaushala) throw notFound('Gaushala');

  let finalLocationId = locationId || gaushala.locationId;
  if (country) {
    const location = await findOrCreateLocationStructure(country, state, city);
    if (location) finalLocationId = location.id;
  }

  await gaushala.update({ 
    name: name || gaushala.name, 
    locationId: finalLocationId,
    isActive: isActive !== undefined ? isActive : gaushala.isActive
  });
  
  return sendSuccess(res, gaushala, 'Gaushala updated successfully');
});

export const deleteGaushala = crud.remove;
