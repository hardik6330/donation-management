import { Op } from 'sequelize';
import { buildLocationFilter } from './locationHelper.js';

/**
 * Builds a Sequelize where clause for donations based on query parameters.
 * @param {Object} query - The request query object.
 * @param {string} searchPrefix - The prefix for search fields (default: '$donor.')
 * @returns {Promise<Object>} - The where clause and any donorWhere clause.
 */
export const buildDonationFilter = async (query, searchPrefix = '$donor.') => {
  const { 
    search, startDate, endDate, minAmount, maxAmount, 
    categoryId, status, cityId, talukaId, villageId, gaushalaId, kathaId 
  } = query;

  let whereClause = {};
  let donorWhere = {};

  // 1. Gaushala Filter
  if (gaushalaId) {
    whereClause.gaushalaId = gaushalaId;
  }

  // 2. Katha Filter
  if (kathaId) {
    whereClause.kathaId = kathaId;
  }

  // 3. Search Filter
  if (search) {
    if (searchPrefix === '$donor.') {
      // For Admin: using included model path
      whereClause[Op.or] = [
        { [`${searchPrefix}name$`]: { [Op.like]: `%${search}%` } },
        { [`${searchPrefix}email$`]: { [Op.like]: `%${search}%` } },
        { [`${searchPrefix}mobileNumber$`]: { [Op.like]: `%${search}%` } }
      ];
    } else {
      // For Public: using separate donorWhere
      donorWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobileNumber: { [Op.like]: `%${search}%` } }
      ];
    }
  }

  // 2. Date Filter
  if (startDate && endDate) {
    whereClause.createdAt = {
      [Op.between]: [new Date(startDate), new Date(new Date(endDate).setHours(23, 59, 59, 999))]
    };
  } else if (startDate) {
    whereClause.createdAt = { [Op.gte]: new Date(startDate) };
  } else if (endDate) {
    whereClause.createdAt = { [Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
  }

  // 3. Amount Filter
  if (minAmount && maxAmount) {
    whereClause.amount = { [Op.between]: [Number(minAmount), Number(maxAmount)] };
  } else if (minAmount) {
    whereClause.amount = { [Op.gte]: Number(minAmount) };
  } else if (maxAmount) {
    whereClause.amount = { [Op.lte]: Number(maxAmount) };
  }

  // 4. Status Filter
  if (status) {
    if (status === 'pay_later') {
      whereClause.paymentMode = 'pay_later';
    } else {
      whereClause.status = status;
    }
  }

  // 5. Category Filter
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  // 6. Location Filters (Hierarchical)
  const locationFilter = await buildLocationFilter(villageId, talukaId, cityId);
  if (locationFilter) whereClause.locationId = locationFilter;

  return { whereClause, donorWhere };
};
