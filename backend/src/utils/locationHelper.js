import { Location } from '../models/location.js';

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
