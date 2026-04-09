import { Expense } from '../models/expense.js';
import { Gaushala } from '../models/gaushala.js';
import { Katha } from '../models/katha.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

// 1. Add New Expense
export const addExpense = async (req, res) => {
  try {
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
  } catch (error) {
    return sendError(res, 'Failed to add expense', 500, error);
  }
};

// 2. Get All Expenses with Filters
export const getAllExpenses = async (req, res) => {
  try {
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
    return sendSuccess(res, response, 'Expenses fetched successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch expenses', 500, error);
  }
};

// 3. Update Expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return sendError(res, 'Expense not found', 404);
    }

    await expense.update(updateData);
    return sendSuccess(res, expense, 'Expense updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update expense', 500, error);
  }
};

// 4. Delete Expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    
    if (!expense) {
      return sendError(res, 'Expense not found', 404);
    }

    await expense.destroy();
    return sendSuccess(res, null, 'Expense deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete expense', 500, error);
  }
};

// 5. Get Expense Stats
export const getExpenseStats = async (req, res) => {
  try {
    const stats = await Expense.findAll({
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category']
    });

    return sendSuccess(res, stats, 'Expense stats fetched successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch expense stats', 500, error);
  }
};
