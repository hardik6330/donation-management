import { apiSlice } from './apiSlice';

const mandalApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Mandal (Group) CRUD
    getMandals: builder.query({
      query: (params) => ({
        url: '/mandal',
        params,
      }),
      providesTags: ['Mandals'],
    }),
    addMandal: builder.mutation({
      query: (data) => ({
        url: '/mandal',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Mandals'],
    }),
    updateMandal: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/mandal/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Mandals'],
    }),
    deleteMandal: builder.mutation({
      query: (id) => ({
        url: `/mandal/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Mandals'],
    }),
    // Member CRUD
    getMandalMembers: builder.query({
      query: (params) => ({
        url: '/mandal/members',
        params,
      }),
      providesTags: ['MandalMembers'],
    }),
    addMandalMember: builder.mutation({
      query: (data) => ({
        url: '/mandal/members',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MandalMembers', 'Mandals'],
    }),
    updateMandalMember: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/mandal/members/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MandalMembers'],
    }),
    deleteMandalMember: builder.mutation({
      query: (id) => ({
        url: `/mandal/members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MandalMembers', 'Mandals'],
    }),
    // Payment endpoints
    getMandalPayments: builder.query({
      query: (params) => ({
        url: '/mandal/payments',
        params,
      }),
      providesTags: ['MandalPayments'],
    }),
    generateMandalPayments: builder.mutation({
      query: (data) => ({
        url: '/mandal/payments/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MandalPayments', 'Mandals'],
    }),
    updateMandalPayment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/mandal/payments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MandalPayments'],
    }),
    getMandalReport: builder.query({
      query: (params) => ({
        url: '/mandal/payments/report',
        params,
      }),
      providesTags: ['MandalPayments'],
    }),
  }),
});

export const {
  useGetMandalsQuery,
  useAddMandalMutation,
  useUpdateMandalMutation,
  useDeleteMandalMutation,
  useGetMandalMembersQuery,
  useAddMandalMemberMutation,
  useUpdateMandalMemberMutation,
  useDeleteMandalMemberMutation,
  useGetMandalPaymentsQuery,
  useGenerateMandalPaymentsMutation,
  useUpdateMandalPaymentMutation,
  useGetMandalReportQuery,
} = mandalApi;
