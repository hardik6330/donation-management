import { Location } from '../models/index.js';
import { Op } from 'sequelize';

// Helper to clean and format names
export const formatName = (name) => {
  if (!name) return '';
  return name.trim().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Helper to handle hierarchical location creation
export const findOrCreateLocationStructure = async (city, taluka, village) => {
  if (!city) return null;

  city = formatName(city);
  let [cityObj] = await Location.findOrCreate({
    where: { name: city, type: 'city', parentId: null }
  });

  let lastLocation = cityObj;

  if (taluka) {
    taluka = formatName(taluka);
    let [talukaObj] = await Location.findOrCreate({
      where: { name: taluka, type: 'taluka', parentId: cityObj.id }
    });
    lastLocation = talukaObj;

    if (village) {
      village = formatName(village);
      let [villageObj] = await Location.findOrCreate({
        where: { name: village, type: 'village', parentId: talukaObj.id }
      });
      lastLocation = villageObj;
    }
  }

  return lastLocation;
};

/**
 * Extract city, taluka, village from a location object with nested parent includes.
 * Works with both while-loop traversal and nested parent structure.
 */
export const extractLocationHierarchy = (locationObj) => {
  let city = '', taluka = '', village = '';
  if (!locationObj) return { city, taluka, village };

  let current = locationObj;
  while (current) {
    if (current.type === 'city') city = current.name;
    if (current.type === 'taluka') taluka = current.name;
    if (current.type === 'village') village = current.name;
    current = current.parent;
  }
  return { city, taluka, village };
};

/**
 * Build a locationId filter for Sequelize queries.
 * Given villageId/talukaId/cityId, returns the where clause for locationId
 * that includes all descendant locations.
 */
export const buildLocationFilter = async (villageId, talukaId, cityId) => {
  if (villageId) return villageId;
  if (talukaId) {
    const villages = await Location.findAll({ where: { parentId: talukaId }, attributes: ['id'] });
    return { [Op.in]: [talukaId, ...villages.map(v => v.id)] };
  }
  if (cityId) {
    const talukas = await Location.findAll({ where: { parentId: cityId }, attributes: ['id'] });
    const talukaIds = talukas.map(t => t.id);
    const villages = await Location.findAll({ where: { parentId: { [Op.in]: talukaIds } }, attributes: ['id'] });
    return { [Op.in]: [cityId, ...talukaIds, ...villages.map(v => v.id)] };
  }
  return null;
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
