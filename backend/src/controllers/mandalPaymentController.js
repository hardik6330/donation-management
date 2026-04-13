import { MandalPayment, MandalMember, Mandal, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound, badRequest } from '../utils/httpError.js';

// Generate unpaid records for all active members for a given month
export const generateMonthlyPayments = asyncHandler(async (req, res) => {
  const { month, mandalId } = req.body;

  const memberWhere = { isActive: true };
  if (mandalId) {
    memberWhere.mandalId = mandalId;
  }

  const activeMembers = await MandalMember.findAll({
    where: memberWhere,
    include: [{ model: Mandal, as: 'mandal', attributes: ['id', 'price'] }]
  });

  const paymentWhere = { month };
  if (mandalId) {
    // If mandalId is provided, we only check for members of that mandal
    const memberIds = activeMembers.map(m => m.id);
    paymentWhere.memberId = { [Op.in]: memberIds };
  }

  const existingPayments = await MandalPayment.findAll({
    where: paymentWhere,
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
});

// Get payments for a specific month
export const getMonthlyPayments = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { month, mandalId, status, search } = req.query;

  if (!month) {
    throw badRequest('Month parameter is required');
  }

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
});

// Update payment status
export const updatePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, paidDate, notes, amount } = req.body;

  const payment = await MandalPayment.findByPk(id);
  if (!payment) {
    throw notFound('Payment record');
  }

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
});

// Monthly report
export const getMonthlyReport = asyncHandler(async (req, res) => {
  const { month } = req.query;
  if (!month) {
    throw badRequest('Month parameter is required');
  }

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
});
