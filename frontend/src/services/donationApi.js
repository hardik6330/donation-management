import { apiSlice } from './apiSlice';

const donationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQRCode: builder.query({
      query: () => '/donations/qr',
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
    updateDonation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/donations/${id}`,
        method: 'PUT',
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
    sendAnnouncement: builder.mutation({
      query: (data) => ({
        url: '/admin/announcement',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AnnouncementHistory'],
    }),
    getAnnouncementHistory: builder.query({
      query: (params) => ({
        url: '/admin/announcement/history',
        params,
      }),
      providesTags: ['AnnouncementHistory'],
    }),
    getDonationInstallments: builder.query({
      query: (id) => `/donations/${id}/installments`,
      providesTags: (result, error, id) => [{ type: 'Donations', id }],
    }),
    getDonationStatus: builder.query({
      query: (id) => `/donations/${id}/status`,
    }),
    getLatestSlipNo: builder.query({
      query: () => '/donations/latest-slip-no',
      providesTags: ['Donations'],
    }),
    resendWhatsApp: builder.mutation({
      query: (id) => ({
        url: `/donations/${id}/resend-whatsapp`,
        method: 'POST',
      }),
    }),
    generateInstallmentSlip: builder.mutation({
      query: ({ donationId, installmentId }) => ({
        url: `/donations/${donationId}/installments/${installmentId}/slip`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { donationId }) => [{ type: 'Donations', id: donationId }],
    }),
  }),
});

export const {
  useGetQRCodeQuery,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useUpdateDonationMutation,
  useGetAdminStatsQuery,
  useGetAllDonationsQuery,
  useGetDonorsQuery,
  useLazyGetDonorsQuery,
  useSendAnnouncementMutation,
  useGetAnnouncementHistoryQuery,
  useGetDonationInstallmentsQuery,
  useGetDonationStatusQuery,
  useGetLatestSlipNoQuery,
  useResendWhatsAppMutation,
  useGenerateInstallmentSlipMutation,
} = donationApi;
