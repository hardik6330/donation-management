import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({
    getQRCode: builder.query({
      query: () => '/donations/qr',
    }),
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
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/donations/order',
        method: 'POST',
        body: data,
      }),
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: '/donations/verify',
        method: 'POST',
        body: data,
      }),
    }),
    getAdminStats: builder.query({
      query: () => ({
        url: '/admin/stats',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
    }),
    getAllDonations: builder.query({
      query: (params) => ({
        url: '/admin/donations',
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
    }),
  }),
});

export const { useGetQRCodeQuery, useLoginMutation, useRegisterMutation, useGetUserByMobileQuery, useCreateOrderMutation, useVerifyPaymentMutation, useGetAdminStatsQuery, useGetAllDonationsQuery } = apiSlice;
