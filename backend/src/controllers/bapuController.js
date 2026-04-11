import { BapuSchedule, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { findOrCreateLocationStructure } from '../utils/locationHelper.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';

// Get all schedules with filtering
export const getBapuSchedules = asyncHandler(async (req, res) => {
  const { page, limit, isFetchAll, queryLimit, offset } = getPaginationParams(req.query);
  const { startDate, endDate, eventType, status, locationId, cityId, talukaId, villageId } = req.query;
  let where = {};

  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.date = { [Op.gte]: startDate };
  }

  if (eventType) where.eventType = eventType;
  if (status) where.status = status;
  
  // Hierarchical Location Filter
  if (locationId) {
    where.locationId = locationId;
  } else if (villageId) {
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

  const { count, rows: schedules } = await BapuSchedule.findAndCountAll({
    where,
    include: [
      { 
        model: Location, 
        as: 'location',
        include: [
          { 
            model: Location, 
            as: 'parent',
            include: [{ model: Location, as: 'parent' }]
          }
        ]
      }
    ],
    order: [['date', 'ASC'], ['time', 'ASC']],
    limit: queryLimit,
    offset: offset,
    distinct: true,
  });

  // Format the response to include city, taluka, village names
  const formattedSchedules = schedules.map(schedule => {
    const s = schedule.toJSON();
    let city = '', taluka = '', village = '';

    if (s.location) {
      if (s.location.type === 'village') {
        village = s.location.name;
        if (s.location.parent) {
          taluka = s.location.parent.name;
          if (s.location.parent.parent) {
            city = s.location.parent.parent.name;
          }
        }
      } else if (s.location.type === 'taluka') {
        taluka = s.location.name;
        if (s.location.parent) {
          city = s.location.parent.name;
        }
      } else if (s.location.type === 'city') {
        city = s.location.name;
      }
    }

    return {
      ...s,
      city,
      taluka,
      village
    };
  });

  const responseData = getPaginatedResponse({
    rows: formattedSchedules,
    count,
    limit,
    page,
    isFetchAll,
    dataKey: 'data'
  });

  return sendSuccess(res, responseData, 'All schedules records fetched successfully');
});

// Add new schedule
export const addBapuSchedule = asyncHandler(async (req, res) => {
  const { date, time, city, taluka, village, locationId, eventType, contactPerson, mobileNumber, description, amount } = req.body;
  
  let finalLocationId = locationId;
  
  // If location names are provided, use findOrCreate logic
  if (city) {
    const location = await findOrCreateLocationStructure(city, taluka, village);
    if (location) finalLocationId = location.id;
  }

  const schedule = await BapuSchedule.create({
    date,
    time,
    locationId: finalLocationId,
    eventType,
    contactPerson,
    mobileNumber,
    description,
    amount: amount ? Number(amount) : null,
    status: 'scheduled'
  });

  return sendSuccess(res, schedule, 'Bapu schedule added successfully', 201);
});

// Update schedule
export const updateBapuSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { city, taluka, village, locationId, ...rest } = req.body;

  const schedule = await BapuSchedule.findByPk(id);
  if (!schedule) {
    const error = new Error('Schedule not found');
    error.statusCode = 404;
    throw error;
  }

  let finalLocationId = locationId;
  if (city) {
    const location = await findOrCreateLocationStructure(city, taluka, village);
    if (location) finalLocationId = location.id;
  }

  await schedule.update({ ...rest, locationId: finalLocationId });
  return sendSuccess(res, schedule, 'Schedule updated successfully');
});

// Delete schedule
export const deleteBapuSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const schedule = await BapuSchedule.findByPk(id);
  if (!schedule) {
    const error = new Error('Schedule not found');
    error.statusCode = 404;
    throw error;
  }

  await schedule.destroy();
  return sendSuccess(res, null, 'Schedule deleted successfully');
});
