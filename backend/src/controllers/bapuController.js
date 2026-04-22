import { BapuSchedule, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { findOrCreateLocationStructure, extractLocationHierarchy, buildLocationFilter, formatLocationAddress } from '../utils/locationHelper.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound, badRequest } from '../utils/httpError.js';
import { createCRUDController } from '../utils/createCRUDController.js';

const crud = createCRUDController({ Model: BapuSchedule, name: 'Schedule' });

// Get all schedules with filtering
export const getBapuSchedules = asyncHandler(async (req, res) => {
  const { page, limit, isFetchAll, queryLimit, offset } = getPaginationParams(req.query);
  const { startDate, endDate, eventType, status, locationId, city, state, country } = req.query;
  
  const activeScopes = [];
  if (startDate) activeScopes.push({ method: ['dateRange', startDate, endDate] });
  if (eventType) activeScopes.push({ method: ['eventType', eventType] });
  if (status) activeScopes.push({ method: ['status', status] });
  if (city || state || country) activeScopes.push({ method: ['location', city, state, country] });

  const { count, rows: schedules } = await BapuSchedule.scope(activeScopes).findAndCountAll({
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
    return {
      ...s,
      ...extractLocationHierarchy(s.location),
      fullLocation: formatLocationAddress(s.location)
    };
  });

  const responseData = getPaginatedResponse({
    rows: formattedSchedules,
    count,
    limit,
    page,
    isFetchAll,
  });

  return sendSuccess(res, responseData, 'All schedules records fetched successfully');
});

// Add new schedule
export const addBapuSchedule = asyncHandler(async (req, res) => {
  const { date, time, city, state, country, locationId, eventType, contactPerson, mobileNumber, description, amount } = req.body;
  
  let finalLocationId = locationId;
  
  // If location names are provided, use findOrCreate logic
  if (country) {
    const location = await findOrCreateLocationStructure(country, state, city);
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
  const { city, state, country, locationId, ...rest } = req.body;

  const schedule = await BapuSchedule.findByPk(id);
  if (!schedule) throw notFound('Schedule');

  let finalLocationId = locationId;
  if (country) {
    const location = await findOrCreateLocationStructure(country, state, city);
    if (location) finalLocationId = location.id;
  }

  await schedule.update({ ...rest, locationId: finalLocationId });
  return sendSuccess(res, schedule, 'Schedule updated successfully');
});

export const deleteBapuSchedule = crud.remove;
