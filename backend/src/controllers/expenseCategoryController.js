import { ExpenseCategory } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound } from '../utils/httpError.js';

export const addExpenseCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const existing = await ExpenseCategory.findOne({ where: { name } });
  if (existing) {
    return sendSuccess(res, existing, 'Expense category already exists');
  }

  const category = await ExpenseCategory.create({ name });
  return sendSuccess(res, category, 'Expense category created successfully', 201);
});

export const getExpenseCategories = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { page, limit, offset, isFetchAll } = getPaginationParams(req.query);

  const scopes = [];
  if (search && search.trim() !== '') scopes.push({ method: ['search', search] });

  const { count, rows } = await ExpenseCategory.scope(scopes).findAndCountAll({
    order: [['name', 'ASC']],
    limit: isFetchAll ? undefined : limit,
    offset: isFetchAll ? undefined : offset,
  });

  const response = getPaginatedResponse({ rows, count, limit, page, isFetchAll });
  return sendSuccess(res, response, 'Expense categories fetched successfully');
});

export const updateExpenseCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await ExpenseCategory.findByPk(id);
  if (!category) throw notFound('Expense category');
  await category.update(req.body);
  return sendSuccess(res, category, 'Expense category updated successfully');
});

export const deleteExpenseCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await ExpenseCategory.findByPk(id);
  if (!category) throw notFound('Expense category');
  await category.destroy();
  return sendSuccess(res, null, 'Expense category deleted successfully');
});
