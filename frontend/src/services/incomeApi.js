import { apiSlice } from './apiSlice';
import { createCRUDEndpoints } from './createCRUDEndpoints';

const incomeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ...createCRUDEndpoints({
      entity: 'Income',
      entityPlural: 'Income',
      tag: 'Income',
      basePath: '/income',
    })(builder),
    getIncomeStats: builder.query({
      query: () => '/income/stats',
      providesTags: ['Income'],
    }),
  }),
});

export const {
  useGetIncomeQuery,
  useAddIncomeMutation,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
  useGetIncomeStatsQuery,
} = incomeApi;
