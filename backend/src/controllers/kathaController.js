import { Katha } from '../models/katha.js';
import { Location } from '../models/location.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { findOrCreateLocationStructure, getAllSubLocationIds } from '../utils/locationHelper.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';

export const getKathas = async (req, res) => {
  try {
    const { page, limit, isFetchAll, queryLimit, offset } = getPaginationParams(req.query);
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

    const { count, rows } = await Katha.findAndCountAll({
      where,
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
      order: [['createdAt', 'DESC']],
      limit: queryLimit,
      offset
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

      return { ...katha, city, taluka, village };
    });

    const response = getPaginatedResponse({ rows: formattedKathas, count, limit, page, isFetchAll, dataKey: 'rows' });
    return sendSuccess(res, response);
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
