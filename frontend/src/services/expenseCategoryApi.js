import { apiSlice } from './apiSlice';
import { createCRUDEndpoints } from './createCRUDEndpoints';

const expenseCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ...createCRUDEndpoints({
      entity: 'ExpenseCategory',
      entityPlural: 'ExpenseCategories',
      tag: 'ExpenseCategories',
      basePath: '/expense-categories',
    })(builder),
  }),
});

export const {
  useGetExpenseCategoriesQuery,
  useLazyGetExpenseCategoriesQuery,
  useAddExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} = expenseCategoryApi;
