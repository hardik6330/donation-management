import { apiSlice } from './apiSlice';
import { createCRUDEndpoints } from './createCRUDEndpoints';

const bapuApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ...createCRUDEndpoints({
      entity: 'BapuSchedule',
      entityPlural: 'BapuSchedules',
      tag: 'BapuSchedule',
      basePath: '/bapu',
      listPath: '/bapu/all',
      createPath: '/bapu/add',
    })(builder),
  }),
});

export const {
  useGetBapuSchedulesQuery,
  useAddBapuScheduleMutation,
  useUpdateBapuScheduleMutation,
  useDeleteBapuScheduleMutation,
} = bapuApi;
