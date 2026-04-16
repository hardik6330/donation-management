import { Location } from '../models/index.js';
import { Op } from 'sequelize';

// Helper to clean and format names to UPPERCASE
export const formatName = (name) => {
  if (!name) return '';
  return name.trim().toUpperCase();
};

// Helper to handle hierarchical location creation (Country > State > City)
export const findOrCreateLocationStructure = async (country, state, city) => {
  if (!country) return null;

  country = formatName(country);
  let [countryObj] = await Location.findOrCreate({
    where: { name: country, type: 'country', parentId: null } 
  });

  let lastLocation = countryObj;

  if (state) {
    state = formatName(state);
    let [stateObj] = await Location.findOrCreate({
      where: { name: state, type: 'state', parentId: countryObj.id }
    });
    lastLocation = stateObj;

    if (city) {
      city = formatName(city);
      let [cityObj] = await Location.findOrCreate({
        where: { name: city, type: 'city', parentId: stateObj.id }
      });
      lastLocation = cityObj;
    }
  }

  return lastLocation;
};

/**
 * Extract country, state, city from a location object with nested parent includes.
 * Works with both while-loop traversal and nested parent structure.
 */
export const extractLocationHierarchy = (locationObj, options = {}) => {
  const { useGujarati = false } = options;
  let country = '', state = '', city = '';
  if (!locationObj) return { country, state, city };

  let current = locationObj;
  while (current) {
    const name = (useGujarati && current.nameGuj) ? current.nameGuj : current.name;
    if (current.type === 'country') country = name;
    if (current.type === 'state') state = name;
    if (current.type === 'city') city = name;
    current = current.parent;
  }
  return { country, state, city };
};

/**
 * Build a locationId filter for Sequelize queries.
 * Given cityId/stateId/countryId OR a single locationId, returns the where clause
 * for locationId that includes all descendant locations.
 */
export const buildLocationFilter = async (cityId, stateId, countryId, locationId) => {
  if (locationId) {
    const ids = await getAllSubLocationIds(locationId);
    return { [Op.in]: ids };
  }
  if (cityId) return cityId;
  if (stateId) {
    const cities = await Location.findAll({ where: { parentId: stateId }, attributes: ['id'] });
    return { [Op.in]: [stateId, ...cities.map(c => c.id)] };
  }
  if (countryId) {
    const states = await Location.findAll({ where: { parentId: countryId }, attributes: ['id'] });
    const stateIds = states.map(s => s.id);
    const cities = await Location.findAll({ where: { parentId: { [Op.in]: stateIds } }, attributes: ['id'] });
    return { [Op.in]: [countryId, ...stateIds, ...cities.map(c => c.id)] };
  }
  return null;
};

/**
 * Formats a location object into a string address like "City, State, Country".
 * Handles both nested parent objects and Gujarati names.
 */
export const formatLocationAddress = (locationObj, options = {}) => {
  const { useGujarati = false, separator = ', ' } = options;
  if (!locationObj) return '';

  const { country, state, city } = extractLocationHierarchy(locationObj);

  // Re-traversing for Gujarati if requested
  if (useGujarati) {
    let current = locationObj;
    const gujParts = [];
    while (current) {
      gujParts.push(current.nameGuj || current.name);
      current = current.parent;
    }
    return gujParts.join(separator);
  }

  const parts = [];
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (country) parts.push(country);

  return parts.filter(Boolean).join(separator);
};

// Helper to get all sub-location IDs recursively
export const getAllSubLocationIds = async (parentId) => {
  if (!parentId) return [];

  const subLocations = await Location.findAll({
    where: { parentId },
    attributes: ['id']
  });

  const subIds = subLocations.map(loc => loc.id);

  let allIds = [parentId, ...subIds];

  for (const subId of subIds) {
    const descendantIds = await getAllSubLocationIds(subId);
    allIds = [...new Set([...allIds, ...descendantIds])];
  }

  return allIds;
};
