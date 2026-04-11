import { apiSlice } from './apiSlice';

const kathaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getKathas: builder.query({
      query: (params) => ({
        url: '/katha/all',
        params,
      }),
      providesTags: ['Kathas'],
    }),
    addKatha: builder.mutation({
      query: (data) => ({
        url: '/katha/add',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Kathas'],
    }),
    updateKatha: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/katha/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Kathas'],
    }),
    deleteKatha: builder.mutation({
      query: (id) => ({
        url: `/katha/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Kathas'],
    }),
  }),
});

export const {
  useGetKathasQuery,
  useLazyGetKathasQuery,
  useAddKathaMutation,
  useUpdateKathaMutation,
  useDeleteKathaMutation,
} = kathaApi;
