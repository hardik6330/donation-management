import { BapuSchedule } from '../models/bapuSchedule.js';
import { Location } from '../models/location.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { findOrCreateLocationStructure } from '../utils/locationHelper.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';

// Get all schedules with filtering
export const getBapuSchedules = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('❌ [getBapuSchedules] Error:', error);
    return sendError(res, 'Error fetching Bapu schedules', 500, error);
  }
};

// Add new schedule
export const addBapuSchedule = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('❌ [addBapuSchedule] Error:', error);
    return sendError(res, 'Error adding Bapu schedule', 500, error);
  }
};

// Update schedule
export const updateBapuSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const schedule = await BapuSchedule.findByPk(id);
    if (!schedule) {
      return sendError(res, 'Schedule not found', 404);
    }

    await schedule.update(updateData);
    return sendSuccess(res, schedule, 'Schedule updated successfully');
  } catch (error) {
    console.error('❌ [updateBapuSchedule] Error:', error);
    return sendError(res, 'Error updating schedule', 500, error);
  }
};

// Delete schedule
export const deleteBapuSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await BapuSchedule.findByPk(id);
    if (!schedule) {
      return sendError(res, 'Schedule not found', 404);
    }

    await schedule.destroy();
    return sendSuccess(res, null, 'Schedule deleted successfully');
  } catch (error) {
    console.error('❌ [deleteBapuSchedule] Error:', error);
    return sendError(res, 'Error deleting schedule', 500, error);
  }
};
