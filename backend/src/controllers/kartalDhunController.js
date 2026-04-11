import { KartalDhun, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { findOrCreateLocationStructure } from '../utils/locationHelper.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const addKartalDhun = asyncHandler(async (req, res) => {
  const { name, date, amount, locationId, city, taluka, village, description } = req.body;

  let finalLocationId = locationId;
  if (city) {
    const location = await findOrCreateLocationStructure(city, taluka, village);
    if (location) finalLocationId = location.id;
  }

  const record = await KartalDhun.create({
    name, date, amount, locationId: finalLocationId, description
  });

  return sendSuccess(res, record, 'Kartal Dhun income added successfully', 201);
});

export const getAllKartalDhun = asyncHandler(async (req, res) => {
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
});

export const updateKartalDhun = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await KartalDhun.findByPk(id);
  if (!record) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }

  const { city, taluka, village, locationId, ...rest } = req.body;
  let finalLocationId = locationId;
  if (city) {
    const location = await findOrCreateLocationStructure(city, taluka, village);
    if (location) finalLocationId = location.id;
  }

  await record.update({ ...rest, locationId: finalLocationId });
  return sendSuccess(res, record, 'Record updated successfully');
});

export const deleteKartalDhun = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await KartalDhun.findByPk(id);
  if (!record) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }

  await record.destroy();
  return sendSuccess(res, null, 'Record deleted successfully');
});
