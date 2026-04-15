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

    toast.error(message);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Donations', 'Donors', 'Categories', 'Cities',
    'Gaushalas', 'Kathas', 'BapuSchedule', 'Expenses',
    'Sevaks', 'Mandals', 'MandalMembers', 'MandalPayments',
    'KartalDhun', 'Roles', 'SystemUsers', 'AnnouncementHistory',
  ],
  endpoints: () => ({}),
});
