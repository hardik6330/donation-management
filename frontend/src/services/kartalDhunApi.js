import { apiSlice } from './apiSlice';

const kartalDhunApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getKartalDhun: builder.query({
      query: (params) => ({
        url: '/kartal-dhun',
        params,
      }),
      providesTags: ['KartalDhun'],
    }),
    addKartalDhun: builder.mutation({
      query: (data) => ({
        url: '/kartal-dhun',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['KartalDhun'],
    }),
    updateKartalDhun: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/kartal-dhun/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['KartalDhun'],
    }),
    deleteKartalDhun: builder.mutation({
      query: (id) => ({
        url: `/kartal-dhun/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['KartalDhun'],
    }),
  }),
});

export const {
  useGetKartalDhunQuery,
  useAddKartalDhunMutation,
  useUpdateKartalDhunMutation,
  useDeleteKartalDhunMutation,
} = kartalDhunApi;
