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
  }),
});

export const {
  useGetSevaksQuery,
  useLazyGetSevaksQuery,
  useAddSevakMutation,
  useUpdateSevakMutation,
  useDeleteSevakMutation,
} = sevakApi;
