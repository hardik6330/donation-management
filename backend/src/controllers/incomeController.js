import { Income, Gaushala, Katha, sequelize } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound } from '../utils/httpError.js';
import { createCRUDController } from '../utils/createCRUDController.js';

const crud = createCRUDController({ Model: Income, name: 'Income' });

// 1. Add New Income
export const addIncome = asyncHandler(async (req, res) => {
  const { title, date, amount, note } = req.body;

  const income = await Income.create({
    title,
    date: date || new Date(),
    amount,
    note
  });

  return sendSuccess(res, income, 'Income recorded successfully', 201);
});

// 2. Get All Income with Filters
export const getAllIncome = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { startDate, endDate, minAmount, maxAmount, search } = req.query;

  const activeScopes = [
    { method: ['byDateRange', startDate, endDate] },
    { method: ['search', search] }
  ].filter(s => s !== null && s !== undefined);

  const where = {};

  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount[Op.gte] = minAmount;
    if (maxAmount) where.amount[Op.lte] = maxAmount;
  }

  const { count, rows } = await Income.scope(activeScopes).findAndCountAll({
    where,
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });

  const response = getPaginatedResponse({ rows, count, limit, page });
  return sendSuccess(res, response, 'All income records fetched successfully');
});

// 3. Update Income
export const updateIncome = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const income = await Income.findByPk(id);
  if (!income) {
    throw notFound('Income');
  }

  await income.update(updateData);
  return sendSuccess(res, income, 'Income updated successfully');
});

// 4. Delete Income
export const deleteIncome = crud.remove;

// 5. Get Income Stats
export const getIncomeStats = asyncHandler(async (req, res) => {
  const stats = await Income.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ]
  });

  return sendSuccess(res, stats[0], 'Income stats fetched successfully');
});
