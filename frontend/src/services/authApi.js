import { apiSlice } from './apiSlice';

const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getUserByMobile: builder.query({
      query: (mobileNumber) => `/users/mobile/${mobileNumber}`,
    }),
    getSystemUsers: builder.query({
      query: (params) => ({
        url: '/users/system',
        params,
      }),
      providesTags: ['SystemUsers'],
    }),
    addSystemUser: builder.mutation({
      query: (data) => ({
        url: '/users/system',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SystemUsers'],
    }),
    updateSystemUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/system/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SystemUsers'],
    }),
    deleteSystemUser: builder.mutation({
      query: (id) => ({
        url: `/users/system/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SystemUsers'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserByMobileQuery,
  useGetSystemUsersQuery,
  useAddSystemUserMutation,
  useUpdateSystemUserMutation,
  useDeleteSystemUserMutation,
} = authApi;
