import { apiSlice } from './apiSlice';
import { createCRUDEndpoints } from './createCRUDEndpoints';

const expenseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ...createCRUDEndpoints({
      entity: 'Expense',
      entityPlural: 'Expenses',
      tag: 'Expenses',
      basePath: '/expenses',
    })(builder),
    getExpenseStats: builder.query({
      query: () => '/expenses/stats',
      providesTags: ['Expenses'],
    }),
    getExpenseInstallments: builder.query({
      query: (id) => `/expenses/${id}/installments`,
      providesTags: ['Expenses'],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseStatsQuery,
  useGetExpenseInstallmentsQuery,
} = expenseApi;
