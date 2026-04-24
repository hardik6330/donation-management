import { Expense, ExpenseInstallment, Gaushala, Katha, sequelize } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound } from '../utils/httpError.js';
import { createCRUDController } from '../utils/createCRUDController.js';

const crud = createCRUDController({ Model: Expense, name: 'Expense' });

const computePaymentFields = (status, amount, paidAmount) => {
  const amt = Number(amount) || 0;
  if (status === 'pay_later') return { paidAmount: 0, remainingAmount: amt };
  if (status === 'partially_paid') {
    const paid = Number(paidAmount) || 0;
    return { paidAmount: paid, remainingAmount: Math.max(amt - paid, 0) };
  }
  return { paidAmount: amt, remainingAmount: 0 };
};

// 1. Add New Expense
export const addExpense = asyncHandler(async (req, res) => {
  const { date, amount, category, description, gaushalaId, kathaId, paymentMode, status, paidAmount } = req.body;
  const finalStatus = status || 'completed';
  const payment = computePaymentFields(finalStatus, amount, paidAmount);

  const expense = await Expense.create({
    date: date || new Date(),
    amount,
    category,
    description,
    gaushalaId: gaushalaId || null,
    kathaId: kathaId || null,
    paymentMode: paymentMode || 'cash',
    status: finalStatus,
    paidAmount: payment.paidAmount,
    remainingAmount: payment.remainingAmount,
  });

  // Log initial installment for any paid amount
  if (Number(payment.paidAmount) > 0) {
    await ExpenseInstallment.create({
      expenseId: expense.id,
      amount: Number(payment.paidAmount),
      paymentMode: paymentMode || 'cash',
      paymentDate: date || new Date(),
      notes: finalStatus === 'completed' ? 'Full payment' : 'Initial partial payment',
    });
  }

  return sendSuccess(res, expense, 'Expense recorded successfully', 201);
});

// 2. Get All Expenses with Filters
export const getAllExpenses = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { startDate, endDate, category, gaushalaId, kathaId, minAmount, maxAmount, paymentMode, status, search } = req.query;

  const activeScopes = [
    { method: ['byCategory', category] },
    { method: ['byDateRange', startDate, endDate] },
    { method: ['search', search] }
  ].filter(s => s !== null && s !== undefined);

  const where = {};

  if (gaushalaId) {
    where.gaushalaId = gaushalaId;
  }

  if (kathaId) {
    where.kathaId = kathaId;
  }

  if (paymentMode) {
    where.paymentMode = paymentMode;
  }

  if (status) {
    where.status = status;
  }

  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount[Op.gte] = minAmount;
    if (maxAmount) where.amount[Op.lte] = maxAmount;
  }

  const { count, rows } = await Expense.scope(activeScopes).findAndCountAll({
    where,
    include: [
      { model: Gaushala, as: 'gaushala', attributes: ['id', 'name'] },
      { model: Katha, as: 'katha', attributes: ['id', 'name'] }
    ],
    order: [['date', 'DESC'], ['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });

  const response = getPaginatedResponse({ rows, count, limit, page });
  return sendSuccess(res, response, 'All expenses records fetched successfully');
});

// 3. Update Expense
export const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const expense = await Expense.findByPk(id);
  if (!expense) {
    throw notFound('Expense');
  }

  // Handle empty strings for optional IDs
  if (updateData.gaushalaId === '') updateData.gaushalaId = null;
  if (updateData.kathaId === '') updateData.kathaId = null;

  // Recompute paid/remaining if status or amounts changed
  const prevPaid = Number(expense.paidAmount || 0);
  if (updateData.status || updateData.amount !== undefined || updateData.paidAmount !== undefined) {
    const nextStatus = updateData.status || expense.status;
    const nextAmount = updateData.amount !== undefined ? updateData.amount : expense.amount;
    const nextPaid = updateData.paidAmount !== undefined ? updateData.paidAmount : expense.paidAmount;
    const payment = computePaymentFields(nextStatus, nextAmount, nextPaid);
    updateData.status = nextStatus;
    updateData.paidAmount = payment.paidAmount;
    updateData.remainingAmount = payment.remainingAmount;
  }

  // Log installment for any increase in paidAmount
  if (updateData.paidAmount !== undefined) {
    const newPaid = Number(updateData.paidAmount);
    if (newPaid > prevPaid) {
      await ExpenseInstallment.create({
        expenseId: expense.id,
        amount: newPaid - prevPaid,
        paymentMode: updateData.paymentMode || expense.paymentMode || 'cash',
        paymentDate: new Date(),
        notes: updateData.status === 'completed' ? 'Final payment' : 'Partial payment installment',
      });
    }
  }

  await expense.update(updateData);
  return sendSuccess(res, expense, 'Expense updated successfully');
});

export const deleteExpense = crud.remove;

export const getExpenseInstallments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const installments = await ExpenseInstallment.findAll({
    where: { expenseId: id },
    order: [['paymentDate', 'ASC']],
  });
  return sendSuccess(res, installments, 'Expense installments fetched successfully');
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
