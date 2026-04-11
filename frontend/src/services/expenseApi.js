import { apiSlice } from './apiSlice';

const expenseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: (params) => ({
        url: '/expenses',
        params,
      }),
      providesTags: ['Expenses'],
    }),
    addExpense: builder.mutation({
      query: (data) => ({
        url: '/expenses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Expenses'],
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/expenses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Expenses'],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expenses'],
    }),
    getExpenseStats: builder.query({
      query: () => '/expenses/stats',
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
} = expenseApi;
