import { apiSlice } from './apiSlice';

const roleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => '/roles',
      providesTags: ['Roles'],
    }),
    addRole: builder.mutation({
      query: (data) => ({
        url: '/roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),
    updateRole: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;
