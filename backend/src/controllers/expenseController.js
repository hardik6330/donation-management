import { Expense, Gaushala, Katha, sequelize } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';

// 1. Add New Expense
export const addExpense = asyncHandler(async (req, res) => {
  const { date, amount, category, description, gaushalaId, kathaId, paymentMode } = req.body;

  const expense = await Expense.create({
    date: date || new Date(),
    amount,
    category,
    description,
    gaushalaId: gaushalaId || null,
    kathaId: kathaId || null,
    paymentMode: paymentMode || 'cash'
  });

  return sendSuccess(res, expense, 'Expense recorded successfully', 201);
});

// 2. Get All Expenses with Filters
export const getAllExpenses = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { startDate, endDate, category, gaushalaId, kathaId, minAmount, maxAmount, paymentMode } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] };
  } else if (startDate) {
    where.date = { [Op.gte]: startDate };
  } else if (endDate) {
    where.date = { [Op.lte]: endDate };
  }

  if (category) {
    where.category = category;
  }

  if (gaushalaId) {
    where.gaushalaId = gaushalaId;
  }

  if (kathaId) {
    where.kathaId = kathaId;
  }

  if (paymentMode) {
    where.paymentMode = paymentMode;
  }

  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount[Op.gte] = minAmount;
    if (maxAmount) where.amount[Op.lte] = maxAmount;
  }

  const { count, rows } = await Expense.findAndCountAll({
    where,
    include: [
      { model: Gaushala, as: 'gaushala', attributes: ['id', 'name'] },
      { model: Katha, as: 'katha', attributes: ['id', 'name'] }
    ],
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });

  const response = getPaginatedResponse({ rows, count, limit, page, dataKey: 'rows' });
  return sendSuccess(res, response, 'All expenses records fetched successfully');
});

// 3. Update Expense
export const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const expense = await Expense.findByPk(id);
  if (!expense) {
    const error = new Error('Expense not found');
    error.statusCode = 404;
    throw error;
  }

  await expense.update(updateData);
  return sendSuccess(res, expense, 'Expense updated successfully');
});

// 4. Delete Expense
export const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const expense = await Expense.findByPk(id);
  
  if (!expense) {
    const error = new Error('Expense not found');
    error.statusCode = 404;
    throw error;
  }

  await expense.destroy();
  return sendSuccess(res, null, 'Expense deleted successfully');
});

// 5. Get Expense Stats
export const getExpenseStats = asyncHandler(async (req, res) => {
  const stats = await Expense.findAll({
    attributes: [
      'category',
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['category'],
    order: [[sequelize.literal('totalAmount'), 'DESC']]
  });

  const totalExpense = stats.reduce((acc, curr) => acc + parseFloat(curr.getDataValue('totalAmount')), 0);

  return sendSuccess(res, { stats, totalExpense }, 'Expense statistics fetched successfully');
});
