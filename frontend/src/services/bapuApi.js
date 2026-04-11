import { apiSlice } from './apiSlice';

const bapuApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBapuSchedules: builder.query({
      query: (params) => ({
        url: '/bapu/all',
        params,
      }),
      providesTags: ['BapuSchedule'],
    }),
    addBapuSchedule: builder.mutation({
      query: (data) => ({
        url: '/bapu/add',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BapuSchedule'],
    }),
    updateBapuSchedule: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/bapu/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['BapuSchedule'],
    }),
    deleteBapuSchedule: builder.mutation({
      query: (id) => ({
        url: `/bapu/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BapuSchedule'],
    }),
  }),
});

export const {
  useGetBapuSchedulesQuery,
  useAddBapuScheduleMutation,
  useUpdateBapuScheduleMutation,
  useDeleteBapuScheduleMutation,
} = bapuApi;
