/**
 * Extracts pagination parameters from the request query.
 * @param {Object} query - Express request query object.
 * @returns {Object} - Pagination parameters including limit, offset, and isFetchAll.
 */
export const getPaginationParams = (query) => {
  const { page = 1, limit = 10, fetchAll, fields } = query;
  const isFetchAll = fetchAll === 'true' || fetchAll === true;

  // Extract fields if provided (e.g., ?fields=id,amount,donor.name)
  const requestedFields = fields ? fields.split(',') : null;

  return {
    page: Number(page),
    limit: Number(limit),
    isFetchAll,
    queryLimit: isFetchAll ? undefined : Number(limit),
    offset: isFetchAll ? undefined : (Number(page) - 1) * Number(limit),
    requestedFields
  };
};

/**
 * Processes requested fields and returns model attributes and include attributes.
 * @param {Array} requestedFields - Array of strings (e.g., ['id', 'amount', 'donor.name'])
 * @param {string} includeKey - The key used for the included model (default: 'donor')
 * @returns {Object} - { mainAttributes, includeAttributes }
 */
export const processFields = (requestedFields, includeKey = 'donor') => {
  if (!requestedFields) return { mainAttributes: undefined, includeAttributes: undefined };

  const mainAttributes = requestedFields
    .filter(f => !f.includes('.'))
    .filter(f => f.trim() !== '');

  const includeAttributes = requestedFields
    .filter(f => f.startsWith(`${includeKey}.`))
    .map(f => f.split('.')[1])
    .filter(f => f.trim() !== '');

  return {
    mainAttributes: mainAttributes.length > 0 ? mainAttributes : undefined,
    includeAttributes: includeAttributes.length > 0 ? includeAttributes : undefined
  };
};

/**
 * Formats the paginated response data. The collection is always returned under `items`.
 */
export const getPaginatedResponse = ({ rows, count, limit, page, isFetchAll }) => {
  return {
    items: rows,
    totalData: count,
    totalPages: isFetchAll ? 1 : Math.ceil(count / limit),
    currentPage: isFetchAll ? 1 : page,
    limit: isFetchAll ? count : limit,
    fetchAll: isFetchAll,
  };
};
