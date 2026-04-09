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
  tagTypes: ['Donations', 'Donors', 'Categories', 'Cities', 'Gaushalas', 'Kathas', 'BapuSchedule', 'Expenses', 'Sevaks', 'Mandals', 'MandalMembers', 'MandalPayments', 'KartalDhun', 'Roles', 'SystemUsers'],
  endpoints: (builder) => ({
    getQRCode: builder.query({
      query: () => '/donations/qr',
    }),
    // Sevak Endpoints
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
    // Expense Endpoints
    getExpenses: builder.query({
      query: (params) => ({
        url: '/expenses',
        params,
      }),
      providesTags: ['Expenses'],
    }),
    addExpense: builder.mutation({
      query: (data) => ({
        url: '/expenses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Expenses'],
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/expenses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Expenses'],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expenses'],
    }),
    getExpenseStats: builder.query({
      query: () => '/expenses/stats',
      providesTags: ['Expenses'],
    }),
    // ... other endpoints ...
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
      invalidatesTags: ['Donations'],
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: '/donations/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Donations'],
    }),
    getAdminStats: builder.query({
      query: () => '/admin/stats',
    }),
    getAllDonations: builder.query({
      query: (params) => ({
        url: '/admin/donations',
        params,
      }),
      providesTags: ['Donations'],
    }),
    getDonors: builder.query({
      query: (params) => ({
        url: '/admin/donors',
        params,
      }),
      providesTags: ['Donors'],
    }),
    // Master Data Endpoints
    getCities: builder.query({
      query: () => '/master/cities',
    }),
    getSubLocations: builder.query({
      query: (parentId) => `/master/sub-locations/${parentId}`,
    }),
    getCategories: builder.query({
      query: (params) => ({
        url: '/master/categories',
        params,
      }),
      providesTags: ['Categories'],
    }),
    getGaushalas: builder.query({
      query: (params) => ({
        url: '/gaushala/all',
        params,
      }),
      providesTags: ['Gaushalas'],
    }),
    getKathas: builder.query({
      query: (params) => ({
        url: '/katha/all',
        params,
      }),
      providesTags: ['Kathas'],
    }),
    addLocationMaster: builder.mutation({
      query: (data) => ({
        url: '/master/location',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cities'],
    }),
    updateLocation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/master/location/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Cities'],
    }),
    deleteLocation: builder.mutation({
      query: (id) => ({
        url: `/master/location/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cities'],
    }),
    addCategoryMaster: builder.mutation({
      query: (newCategory) => ({
        url: '/master/category',
        method: 'POST',
        body: newCategory,
      }),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/master/category/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/master/category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
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
    addCombinedMasterData: builder.mutation({
      query: (data) => ({
        url: '/master/combined',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cities', 'Categories'],
    }),
    updateDonation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/donations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Donations'],
    }),
    // Mandal (Group) Endpoints
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
    // Mandal Member Endpoints
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
    // Mandal Payment Endpoints
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
    // Kartal Dhun Endpoints
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
    // Role Endpoints
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
    // System User Endpoints
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
  useGetQRCodeQuery, 
  useLoginMutation, 
  useRegisterMutation, 
  useGetUserByMobileQuery, 
  useCreateOrderMutation, 
  useVerifyPaymentMutation, 
  useGetAdminStatsQuery, 
  useGetAllDonationsQuery,
  useGetDonorsQuery,
  useGetCitiesQuery,
  useGetSubLocationsQuery,
  useGetCategoriesQuery,
  useGetGaushalasQuery,
  useGetKathasQuery,
  useAddLocationMasterMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useAddCategoryMasterMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddGaushalaMutation,
  useUpdateGaushalaMutation,
  useDeleteGaushalaMutation,
  useAddKathaMutation,
  useUpdateKathaMutation,
  useDeleteKathaMutation,
  useAddCombinedMasterDataMutation,
  useUpdateDonationMutation,
  useGetBapuSchedulesQuery,
  useAddBapuScheduleMutation,
  useUpdateBapuScheduleMutation,
  useDeleteBapuScheduleMutation,
  useGetExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseStatsQuery,
  useGetSevaksQuery,
  useAddSevakMutation,
  useUpdateSevakMutation,
  useDeleteSevakMutation,
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
  useGetKartalDhunQuery,
  useAddKartalDhunMutation,
  useUpdateKartalDhunMutation,
  useDeleteKartalDhunMutation,
  useGetRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetSystemUsersQuery,
  useAddSystemUserMutation,
  useUpdateSystemUserMutation,
  useDeleteSystemUserMutation,
} = apiSlice;
