import { apiSlice } from './apiSlice';
import { createCRUDEndpoints } from './createCRUDEndpoints';

const kartalDhunApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ...createCRUDEndpoints({
      entity: 'KartalDhun',
      entityPlural: 'KartalDhun',
      tag: 'KartalDhun',
      basePath: '/kartal-dhun',
    })(builder),
  }),
});

export const {
  useGetKartalDhunQuery,
  useAddKartalDhunMutation,
  useUpdateKartalDhunMutation,
  useDeleteKartalDhunMutation,
} = kartalDhunApi;
