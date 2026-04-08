import { MandalPayment } from '../models/mandalPayment.js';
import { MandalMember } from '../models/mandalMember.js';
import { Mandal } from '../models/mandal.js';
import { Location } from '../models/location.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';

// Generate unpaid records for all active members for a given month
export const generateMonthlyPayments = async (req, res) => {
  try {
    const { month } = req.body;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, 'Valid month (YYYY-MM) is required', 400);
    }

    const activeMembers = await MandalMember.findAll({
      where: { isActive: true },
      include: [{ model: Mandal, as: 'mandal', attributes: ['id', 'price'] }]
    });

    const existingPayments = await MandalPayment.findAll({
      where: { month },
      attributes: ['memberId']
    });
    const existingIds = new Set(existingPayments.map(p => p.memberId));

    const newPayments = activeMembers
      .filter(m => !existingIds.has(m.id))
      .map(m => ({
        memberId: m.id,
        month,
        amount: m.mandal?.price || 100,
        status: 'unpaid'
      }));

    if (newPayments.length > 0) {
      await MandalPayment.bulkCreate(newPayments);
    }

    return sendSuccess(res, {
      generated: newPayments.length,
      skipped: existingIds.size
    }, `Generated ${newPayments.length} payment records for ${month}`);
  } catch (error) {
    return sendError(res, 'Failed to generate monthly payments', 500, error);
  }
};

// Get payments for a specific month
export const getMonthlyPayments = async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const { month, mandalId, status, search } = req.query;

    if (!month) return sendError(res, 'Month parameter is required', 400);

    const where = { month };
    if (status && status !== '') where.status = status;

    const memberWhere = {};
    if (mandalId && mandalId !== '') memberWhere.mandalId = mandalId;
    if (search && search.trim() !== '') {
      memberWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobileNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await MandalPayment.findAndCountAll({
      where,
      include: [{
        model: MandalMember,
        as: 'member',
        where: memberWhere,
        include: [
          { model: Mandal, as: 'mandal', attributes: ['id', 'name'] },
          { model: Location, as: 'location', attributes: ['id', 'name'] }
        ]
      }],
      order: [[{ model: MandalMember, as: 'member' }, 'name', 'ASC']],
      limit,
      offset: (page - 1) * limit
    });

    const response = getPaginatedResponse({ rows, count, limit, page, dataKey: 'rows' });
    return sendSuccess(res, response);
  } catch (error) {
    return sendError(res, 'Failed to fetch monthly payments', 500, error);
  }
};

// Update payment status
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paidDate, notes, amount } = req.body;

    const payment = await MandalPayment.findByPk(id);
    if (!payment) return sendError(res, 'Payment record not found', 404);

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'paid' && !paidDate) {
        updateData.paidDate = new Date().toISOString().split('T')[0];
      }
      if (status === 'unpaid') updateData.paidDate = null;
    }
    if (paidDate) updateData.paidDate = paidDate;
    if (notes !== undefined) updateData.notes = notes;
    if (amount !== undefined) updateData.amount = amount;

    await payment.update(updateData);
    return sendSuccess(res, payment, 'Payment updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update payment', 500, error);
  }
};

// Monthly report
export const getMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return sendError(res, 'Month parameter is required', 400);

    const totalMembers = await MandalPayment.count({ where: { month } });
    const paidCount = await MandalPayment.count({ where: { month, status: 'paid' } });
    const unpaidCount = totalMembers - paidCount;
    const totalCollected = await MandalPayment.sum('amount', { where: { month, status: 'paid' } }) || 0;
    const totalPending = await MandalPayment.sum('amount', { where: { month, status: 'unpaid' } }) || 0;

    return sendSuccess(res, {
      month,
      totalMembers,
      paidCount,
      unpaidCount,
      totalCollected,
      totalPending
    });
  } catch (error) {
    return sendError(res, 'Failed to generate report', 500, error);
  }
};
