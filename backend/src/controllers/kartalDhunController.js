import { KartalDhun } from '../models/kartalDhun.js';
import { Location } from '../models/location.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { findOrCreateLocationStructure } from '../utils/locationHelper.js';
import { Op } from 'sequelize';

export const addKartalDhun = async (req, res) => {
  try {
    const { name, date, amount, locationId, city, taluka, village, description } = req.body;
    if (!name || !date || !amount) return sendError(res, 'Name, Date and Amount are required', 400);

    let finalLocationId = locationId;
    if (city) {
      const location = await findOrCreateLocationStructure(city, taluka, village);
      if (location) finalLocationId = location.id;
    }

    const record = await KartalDhun.create({
      name, date, amount, locationId: finalLocationId, description
    });

    return sendSuccess(res, record, 'Kartal Dhun income added successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to add kartal dhun income', 500, error);
  }
};

export const getAllKartalDhun = async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const { search, startDate, endDate, cityId, talukaId, villageId } = req.query;

    const where = {};
    if (search && search.trim() !== '') {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    // Hierarchical Location Filter
    if (villageId) {
      where.locationId = villageId;
    } else if (talukaId) {
      const subLocations = await Location.findAll({
        where: { [Op.or]: [{ id: talukaId }, { parentId: talukaId }] },
        attributes: ['id']
      });
      where.locationId = { [Op.in]: subLocations.map(loc => loc.id) };
    } else if (cityId) {
      const talukas = await Location.findAll({
        where: { parentId: cityId },
        attributes: ['id']
      });
      const talukaIds = talukas.map(t => t.id);
      const villages = await Location.findAll({
        where: { parentId: { [Op.in]: talukaIds } },
        attributes: ['id']
      });
      const allLocationIds = [cityId, ...talukaIds, ...villages.map(v => v.id)];
      where.locationId = { [Op.in]: allLocationIds };
    }

    const { count, rows } = await KartalDhun.findAndCountAll({
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
      order: [['date', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    const formattedRows = rows.map(r => {
      const record = r.toJSON();
      let city = null, taluka = null, village = null;
      let current = record.location;
      while (current) {
        if (current.type === 'city') city = current.name;
        if (current.type === 'taluka') taluka = current.name;
        if (current.type === 'village') village = current.name;
        current = current.parent;
      }
      return { ...record, city, taluka, village };
    });

    const response = getPaginatedResponse({ rows: formattedRows, count, limit, page, dataKey: 'rows' });
    return sendSuccess(res, response, 'All kartal dhun records fetched successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch kartal dhun records', 500, error);
  }
};

export const updateKartalDhun = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await KartalDhun.findByPk(id);
    if (!record) return sendError(res, 'Record not found', 404);

    const { city, taluka, village, locationId, ...rest } = req.body;
    let finalLocationId = locationId;
    if (city) {
      const location = await findOrCreateLocationStructure(city, taluka, village);
      if (location) finalLocationId = location.id;
    }

    await record.update({ ...rest, locationId: finalLocationId });
    return sendSuccess(res, record, 'Record updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update record', 500, error);
  }
};

export const deleteKartalDhun = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await KartalDhun.findByPk(id);
    if (!record) return sendError(res, 'Record not found', 404);

    await record.destroy();
    return sendSuccess(res, null, 'Record deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete record', 500, error);
  }
};
