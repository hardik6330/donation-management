export const createCRUDEndpoints = ({
  entity,
  entityPlural,
  tag,
  basePath,
  listPath,
  createPath,
}) => (builder) => ({
  [`get${entityPlural}`]: builder.query({
    query: (params) => ({ url: listPath ?? basePath, params }),
    providesTags: [tag],
  }),
  [`add${entity}`]: builder.mutation({
    query: (data) => ({ url: createPath ?? basePath, method: 'POST', body: data }),
    invalidatesTags: [tag],
  }),
  [`update${entity}`]: builder.mutation({
    query: ({ id, ...data }) => ({ url: `${basePath}/${id}`, method: 'PUT', body: data }),
    invalidatesTags: [tag],
  }),
  [`delete${entity}`]: builder.mutation({
    query: (id) => ({ url: `${basePath}/${id}`, method: 'DELETE' }),
    invalidatesTags: [tag],
  }),
});
