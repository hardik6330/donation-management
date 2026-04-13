import { Mandal, MandalMember, Location, sequelize } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound } from '../utils/httpError.js';

// ===== MANDAL (Group) CRUD =====

export const addMandal = asyncHandler(async (req, res) => {
  const { name, price, mandalType, isActive } = req.body;

  const mandal = await Mandal.create({
    name,
    price: price || 100,
    mandalType,
    isActive: isActive !== undefined ? isActive : true
  });

  return sendSuccess(res, mandal, 'Mandal created successfully', 201);
});

export const getAllMandals = asyncHandler(async (req, res) => {
  const { page, limit, isFetchAll, queryLimit, offset } = getPaginationParams(req.query);
  const { search, isActive, month } = req.query;

  const where = {};
  if (search && search.trim() !== '') {
    where.name = { [Op.like]: `%${search}%` };
  }
  if (isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true';
  }

  // Default to current month if not provided for payment generation check
  const checkMonth = month || new Date().toISOString().slice(0, 7);

  const { count, rows } = await Mandal.findAndCountAll({
    where,
    attributes: {
      include: [
        [sequelize.literal('(SELECT COUNT(*) FROM MandalMembers WHERE MandalMembers.mandalId = Mandal.id)'), 'memberCount'],
        [
          sequelize.literal(`(
            SELECT COUNT(*) 
            FROM MandalPayments 
            INNER JOIN MandalMembers ON MandalPayments.memberId = MandalMembers.id 
            WHERE MandalMembers.mandalId = Mandal.id AND MandalPayments.month = '${checkMonth}'
          ) > 0`), 
          'paymentGenerated'
        ]
      ]
    },
    order: [['name', 'ASC']],
    limit: queryLimit,
    offset
  });

  const response = getPaginatedResponse({ rows, count, limit, page, isFetchAll, dataKey: 'rows' });
  return sendSuccess(res, response, 'All mandals records fetched successfully');
});

export const updateMandal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mandal = await Mandal.findByPk(id);
  if (!mandal) {
    throw notFound('Mandal');
  }

  await mandal.update(req.body);
  return sendSuccess(res, mandal, 'Mandal updated successfully');
});

export const deleteMandal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mandal = await Mandal.findByPk(id);
  if (!mandal) {
    throw notFound('Mandal');
  }

  await mandal.destroy();
  return sendSuccess(res, null, 'Mandal deleted successfully');
});

// ===== MANDAL MEMBER CRUD =====

export const addMember = asyncHandler(async (req, res) => {
  const { name, mobileNumber, mandalId, locationId } = req.body;

  const member = await MandalMember.create({ name, mobileNumber, mandalId, locationId });
  return sendSuccess(res, member, 'Member added successfully', 201);
});

export const getAllMembers = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { search, mandalId, isActive } = req.query;

  const where = {};
  if (search && search.trim() !== '') {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { mobileNumber: { [Op.like]: `%${search}%` } }
    ];
  }
  if (mandalId && mandalId.trim() !== '') {
    where.mandalId = mandalId;
  }
  if (isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true';
  }

  const { count, rows } = await MandalMember.findAndCountAll({
    where,
    include: [
      { model: Mandal, as: 'mandal', attributes: ['id', 'name'] },
      { model: Location, as: 'location', attributes: ['id', 'name', 'type'] }
    ],
    order: [['name', 'ASC']],
    limit,
    offset: (page - 1) * limit
  });

  const response = getPaginatedResponse({ rows, count, limit, page, dataKey: 'rows' });
  return sendSuccess(res, response, 'All members records fetched successfully');
});

export const updateMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const member = await MandalMember.findByPk(id);
  if (!member) {
    throw notFound('Member');
  }

  await member.update(req.body);
  return sendSuccess(res, member, 'Member updated successfully');
});

export const deleteMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const member = await MandalMember.findByPk(id);
  if (!member) {
    throw notFound('Member');
  }

  await member.destroy();
  return sendSuccess(res, null, 'Member deleted successfully');
});
