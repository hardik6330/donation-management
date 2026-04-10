import { Katha } from '../models/katha.js';
import { Donation } from '../models/donation.js';
import { Location } from '../models/location.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { findOrCreateLocationStructure, getAllSubLocationIds } from '../utils/locationHelper.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op, fn, col, literal } from 'sequelize';

export const getKathas = async (req, res) => {
  try {
    const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
    const { status, locationId, search } = req.query;
    const where = {};
    if (status) where.status = status;

    if (search && search.trim() !== '') {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (locationId) {
      const locationIds = await getAllSubLocationIds(locationId);
      where.locationId = { [Op.in]: locationIds };
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
      let city = null, taluka = null, village = null;

      let current = katha.location;
      while (current) {
        if (current.type === 'city') city = current.name;
        if (current.type === 'taluka') taluka = current.name;
        if (current.type === 'village') village = current.name;
        current = current.parent;
      }

      return {
        ...katha,
        city,
        taluka,
        village,
        totalDonations: parseInt(katha.totalDonations) || 0,
        totalDonationAmount: parseFloat(katha.totalDonationAmount) || 0
      };
    });

    // With GROUP BY, count is an array - use its length for total count
    const totalCount = Array.isArray(count) ? count.length : count;
    const response = getPaginatedResponse({ rows: formattedKathas, count: totalCount, limit, page, isFetchAll, dataKey: 'rows' });
    return sendSuccess(res, response, 'All kathas records fetched successfully');
  } catch (error) {
    return sendError(res, 'Error fetching kathas', 500);
  }
};

export const addKatha = async (req, res) => {
  try {
    const { name, city, taluka, village, locationId, startDate, endDate, status, description } = req.body;
    
    let finalLocationId = locationId;
    
    // If location names are provided, use findOrCreate logic
    if (city) {
      const location = await findOrCreateLocationStructure(city, taluka, village);
      if (location) finalLocationId = location.id;
    }

    if (!finalLocationId) {
      return sendError(res, 'Location is required', 400);
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
  } catch (error) {
    return sendError(res, 'Error adding katha', 500, error);
  }
};

export const updateKatha = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, taluka, village, locationId, startDate, endDate, status, description } = req.body;
    
    const katha = await Katha.findByPk(id);
    if (!katha) {
      return sendError(res, 'Katha not found', 404);
    }

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
  } catch (error) {
    return sendError(res, 'Error updating katha', 500, error);
  }
};

export const deleteKatha = async (req, res) => {
  try {
    const { id } = req.params;
    const katha = await Katha.findByPk(id);
    if (!katha) {
      return sendError(res, 'Katha not found', 404);
    }
    await katha.destroy();
    return sendSuccess(res, null, 'Katha deleted successfully');
  } catch (error) {
    return sendError(res, 'Error deleting katha', 500, error);
  }
};
