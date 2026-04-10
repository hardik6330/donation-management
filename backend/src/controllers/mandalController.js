import { Mandal } from '../models/mandal.js';
import { MandalMember } from '../models/mandalMember.js';
import { Location } from '../models/location.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
// Location still imported for MandalMember includes

// ===== MANDAL (Group) CRUD =====

export const addMandal = async (req, res) => {
  try {
    const { name, price, mandalType, isActive } = req.body;
    if (!name) return sendError(res, 'Name is required', 400);

    const mandal = await Mandal.create({
      name,
      price: price || 100,
      mandalType,
      isActive: isActive !== undefined ? isActive : true
    });

    return sendSuccess(res, mandal, 'Mandal created successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to create mandal', 500, error);
  }
};

export const getAllMandals = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('❌ [getAllMandals] Error:', error);
    return sendError(res, 'Failed to fetch mandals', 500, error);
  }
};

export const updateMandal = async (req, res) => {
  try {
    const { id } = req.params;
    const mandal = await Mandal.findByPk(id);
    if (!mandal) return sendError(res, 'Mandal not found', 404);

    await mandal.update(req.body);
    return sendSuccess(res, mandal, 'Mandal updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update mandal', 500, error);
  }
};

export const deleteMandal = async (req, res) => {
  try {
    const { id } = req.params;
    const mandal = await Mandal.findByPk(id);
    if (!mandal) return sendError(res, 'Mandal not found', 404);

    await mandal.destroy();
    return sendSuccess(res, null, 'Mandal deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete mandal', 500, error);
  }
};

// ===== MANDAL MEMBER CRUD =====

export const addMember = async (req, res) => {
  try {
    const { name, mobileNumber, mandalId, locationId } = req.body;
    if (!name || !mobileNumber || !mandalId) return sendError(res, 'Name, Mobile and Mandal are required', 400);

    const member = await MandalMember.create({ name, mobileNumber, mandalId, locationId });
    return sendSuccess(res, member, 'Member added successfully', 201);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 'Member with this mobile number already exists', 400);
    }
    return sendError(res, 'Failed to add member', 500, error);
  }
};

export const getAllMembers = async (req, res) => {
  try {
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
  } catch (error) {
    return sendError(res, 'Failed to fetch members', 500, error);
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await MandalMember.findByPk(id);
    if (!member) return sendError(res, 'Member not found', 404);

    await member.update(req.body);
    return sendSuccess(res, member, 'Member updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update member', 500, error);
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await MandalMember.findByPk(id);
    if (!member) return sendError(res, 'Member not found', 404);

    await member.destroy();
    return sendSuccess(res, null, 'Member deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete member', 500, error);
  }
};
