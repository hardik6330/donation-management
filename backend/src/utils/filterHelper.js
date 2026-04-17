import { Op } from 'sequelize';

/**
 * Builds a common search filter for multiple fields
 * @param {Array} fields - Fields to search in
 * @param {string} term - Search term
 * @returns {Object} - Sequelize OR condition
 */
export const buildSearchFilter = (fields, term) => {
  if (!term || !fields || fields.length === 0) return {};
  
  return {
    [Op.or]: fields.map(field => ({
      [field]: { [Op.like]: `%${term}%` }
    }))
  };
};

/**
 * Builds a Sequelize where clause for donations based on query parameters.
 * @param {Object} query - The request query object.
 * @param {string} searchPrefix - The prefix for search fields (default: '$donor.')
 * @returns {Promise<Object>} - The where clause and any donorWhere clause.
 */
export const buildDonationFilter = async (query, searchPrefix = '$donor.') => {
  const { 
    search, startDate, endDate, minAmount, maxAmount, 
    categoryId, status, city, state, country, gaushalaId, kathaId
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

  // 4. Location Filters (String based)
  if (city) {
    if (searchPrefix === '$donor.') {
      whereClause[`${searchPrefix}city$`] = { [Op.like]: `%${city}%` };
    } else {
      donorWhere.city = { [Op.like]: `%${city}%` };
    }
  }

  if (state) {
    if (searchPrefix === '$donor.') {
      whereClause[`${searchPrefix}state$`] = { [Op.like]: `%${state}%` };
    } else {
      donorWhere.state = { [Op.like]: `%${state}%` };
    }
  }

  if (country) {
    if (searchPrefix === '$donor.') {
      whereClause[`${searchPrefix}country$`] = { [Op.like]: `%${country}%` };
    } else {
      donorWhere.country = { [Op.like]: `%${country}%` };
    }
  }

  // 5. Date Filter
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

  // 5. Status Filter
  if (status) {
    whereClause.status = status;
  }

  // 6. Category Filter
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  return { whereClause, donorWhere };
};
