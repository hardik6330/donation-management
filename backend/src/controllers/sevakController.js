import { Sevak, Announcement } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound } from '../utils/httpError.js';

// 1. Add New Sevak
export const addSevak = asyncHandler(async (req, res) => {
  const { name, mobileNumber, email, address, city, state, country } = req.body;

  const sevak = await Sevak.create({
    name,
    mobileNumber,
    email: email === '' ? null : email,
    address,
    city,
    state,
    country
  });

  return sendSuccess(res, sevak, 'Sevak added successfully', 201);
});

// 2. Get All Sevaks with Filters
export const getAllSevaks = asyncHandler(async (req, res) => {
  const { page, limit, requestedFields } = getPaginationParams(req.query);
  const { search, city, state, isActive } = req.query;

  const activeScopes = [];
  if (search) activeScopes.push({ method: ['search', search] });
  if (city || state) activeScopes.push({ method: ['location', city, state] });

  const where = {};
  if (isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true';
  }

  const sanitizedScopes = activeScopes.filter(s => s !== null && s !== undefined);

  const lastMessageLiteral = [
    sequelize.literal(`(
      SELECT message
      FROM Announcements
      WHERE Announcements.userId = Sevak.id OR Announcements.mobileNumber = Sevak.mobileNumber
      ORDER BY Announcements.sentAt DESC
      LIMIT 1
    )`),
    'lastMessage'
  ];

  const lastMessageTimeLiteral = [
    sequelize.literal(`(
      SELECT sentAt
      FROM Announcements
      WHERE Announcements.userId = Sevak.id OR Announcements.mobileNumber = Sevak.mobileNumber
      ORDER BY Announcements.sentAt DESC
      LIMIT 1
    )`),
    'lastMessageTime'
  ];

  let attributes = requestedFields || undefined;
  if (Array.isArray(attributes)) {
    const baseFields = attributes.filter(f => !['lastMessage', 'lastMessageTime'].includes(f));
    const includeLiterals = [];
    if (attributes.includes('lastMessage')) includeLiterals.push(lastMessageLiteral);
    if (attributes.includes('lastMessageTime')) includeLiterals.push(lastMessageTimeLiteral);
    attributes = [...baseFields, ...includeLiterals];
  } else if (attributes === undefined) {
    attributes = {
      include: [lastMessageLiteral, lastMessageTimeLiteral]
    };
  }

  const { count, rows } = await Sevak.scope(sanitizedScopes).findAndCountAll({
    where,
    attributes,
    order: [
      [sequelize.literal(`(
        SELECT COALESCE(MAX(sentAt), '1970-01-01')
        FROM Announcements
        WHERE Announcements.userId = Sevak.id
      )`), 'DESC'],
      ['name', 'ASC']
    ],
    limit,
    offset: (page - 1) * limit
  });

  const response = getPaginatedResponse({ rows, count, limit, page, dataKey: 'rows' });
  return sendSuccess(res, response, 'All sevaks records fetched successfully');
});

// 3. Get Single Sevak
export const getSevakById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sevak = await Sevak.findByPk(id);
  if (!sevak) {
    throw notFound('Sevak');
  }
  return sendSuccess(res, sevak, 'Sevak details fetched successfully');
});

// 4. Update Sevak
export const updateSevak = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const sevak = await Sevak.findByPk(id);
  if (!sevak) {
    throw notFound('Sevak');
  }

  if (updateData.email === '') {
    updateData.email = null;
  }

  await sevak.update(updateData);
  return sendSuccess(res, sevak, 'Sevak updated successfully');
});

// 5. Delete Sevak
export const deleteSevak = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sevak = await Sevak.findByPk(id);
  
  if (!sevak) {
    throw notFound('Sevak');
  }

  await sevak.destroy();
  return sendSuccess(res, null, 'Sevak deleted successfully');
});
