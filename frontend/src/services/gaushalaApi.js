import { apiSlice } from './apiSlice';

const gaushalaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGaushalas: builder.query({
      query: (params) => ({
        url: '/gaushala/all',
        params,
      }),
      providesTags: ['Gaushalas'],
    }),
    addGaushala: builder.mutation({
      query: (data) => ({
        url: '/gaushala/add',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Gaushalas'],
    }),
    updateGaushala: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/gaushala/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Gaushalas'],
    }),
    deleteGaushala: builder.mutation({
      query: (id) => ({
        url: `/gaushala/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Gaushalas'],
    }),
  }),
});

export const {
  useGetGaushalasQuery,
  useLazyGetGaushalasQuery,
  useAddGaushalaMutation,
  useUpdateGaushalaMutation,
  useDeleteGaushalaMutation,
} = gaushalaApi;
