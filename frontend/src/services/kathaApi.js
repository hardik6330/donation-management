import { apiSlice } from './apiSlice';
import { createCRUDEndpoints } from './createCRUDEndpoints';

const kathaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ...createCRUDEndpoints({
      entity: 'Katha',
      entityPlural: 'Kathas',
      tag: 'Kathas',
      basePath: '/katha',
      listPath: '/katha/all',
      createPath: '/katha/add',
    })(builder),
  }),
});

export const {
  useGetKathasQuery,
  useLazyGetKathasQuery,
  useAddKathaMutation,
  useUpdateKathaMutation,
  useDeleteKathaMutation,
} = kathaApi;
