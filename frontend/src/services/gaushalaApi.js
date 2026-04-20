import { apiSlice } from './apiSlice';
import { createCRUDEndpoints } from './createCRUDEndpoints';

const gaushalaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ...createCRUDEndpoints({
      entity: 'Gaushala',
      entityPlural: 'Gaushalas',
      tag: 'Gaushalas',
      basePath: '/gaushala',
      listPath: '/gaushala/all',
      createPath: '/gaushala/add',
    })(builder),
  }),
});

export const {
  useGetGaushalasQuery,
  useLazyGetGaushalasQuery,
  useAddGaushalaMutation,
  useUpdateGaushalaMutation,
  useDeleteGaushalaMutation,
} = gaushalaApi;
