import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const message = result.error.data?.message || 'Not authorized';
    
    // Show toast and redirect
    toast.error(message);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Small delay to let user see the toast before redirect
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
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
      query: () => '/admin/stats',
    }),
    getAllDonations: builder.query({
      query: (params) => ({
        url: '/admin/donations',
        params,
      }),
    }),
  }),
});

export const { useGetQRCodeQuery, useLoginMutation, useRegisterMutation, useGetUserByMobileQuery, useCreateOrderMutation, useVerifyPaymentMutation, useGetAdminStatsQuery, useGetAllDonationsQuery } = apiSlice;
