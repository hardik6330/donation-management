import { apiSlice } from './apiSlice';

const sevakApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSevaks: builder.query({
      query: (params) => ({
        url: '/sevak',
        params,
      }),
      providesTags: ['Sevaks'],
    }),
    addSevak: builder.mutation({
      query: (data) => ({
        url: '/sevak',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Sevaks'],
    }),
    updateSevak: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sevak/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Sevaks'],
    }),
    deleteSevak: builder.mutation({
      query: (id) => ({
        url: `/sevak/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sevaks'],
    }),
  }),
});

export const {
  useGetSevaksQuery,
  useAddSevakMutation,
  useUpdateSevakMutation,
  useDeleteSevakMutation,
} = sevakApi;
