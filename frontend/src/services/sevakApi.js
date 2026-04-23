import { apiSlice } from './apiSlice';
import { createCRUDEndpoints } from './createCRUDEndpoints';

const sevakApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ...createCRUDEndpoints({
      entity: 'Sevak',
      entityPlural: 'Sevaks',
      tag: 'Sevaks',
      basePath: '/sevak',
    })(builder),
    getSevakByMobile: builder.query({
      query: (mobileNumber) => `/sevak/mobile/${mobileNumber}`,
    }),
  }),
});

export const {
  useGetSevaksQuery,
  useLazyGetSevaksQuery,
  useAddSevakMutation,
  useUpdateSevakMutation,
  useDeleteSevakMutation,
  useGetSevakByMobileQuery,
} = sevakApi;
