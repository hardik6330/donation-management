import { apiSlice } from './apiSlice';

const masterApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCities: builder.query({
      query: (params) => ({
        url: '/master/cities',
        params,
      }),
      providesTags: ['Cities'],
    }),
    getAllCities: builder.query({
      query: (params) => ({
        url: '/master/all-cities',
        params,
      }),
      providesTags: ['Cities'],
    }),
    getAllStates: builder.query({
      query: (params) => ({
        url: '/master/all-states',
        params,
      }),
      providesTags: ['Cities'],
    }),
    getAllCountries: builder.query({
      query: (params) => ({
        url: '/master/all-countries',
        params,
      }),
      providesTags: ['Cities'],
    }),
    getSubLocations: builder.query({
      query: ({ parentId, ...params }) => ({
        url: `/master/sub-locations/${parentId}`,
        params,
      }),
      providesTags: ['Cities'],
    }),
    getCategories: builder.query({
      query: (params) => ({
        url: '/master/categories',
        params,
      }),
      providesTags: ['Categories'],
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
    addCombinedMasterData: builder.mutation({
      query: (data) => ({
        url: '/master/combined',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cities', 'Categories'],
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useLazyGetCitiesQuery,
  useGetAllCitiesQuery,
  useLazyGetAllCitiesQuery,
  useGetAllStatesQuery,
  useLazyGetAllStatesQuery,
  useGetAllCountriesQuery,
  useLazyGetAllCountriesQuery,
  useGetSubLocationsQuery,
  useLazyGetSubLocationsQuery,
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useAddLocationMasterMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useAddCategoryMasterMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddCombinedMasterDataMutation,
} = masterApi;
