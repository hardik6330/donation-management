import { useCallback, useState } from 'react';

const toLimitNumber = (value) => Number(value);

export const useTable = ({
  initialFilters = { page: 1, limit: 10 },
  allFlagKey = 'fetchAll',
  allLimit = 100,
  allFlagType = 'boolean',
  parseLimit = toLimitNumber,
} = {}) => {
  const [filters, setFilters] = useState(() => ({ ...initialFilters }));

  const formatAllFlag = useCallback(
    (value) => (allFlagType === 'string' ? String(value) : value),
    [allFlagType],
  );

  const applyAllFlag = useCallback(
    (nextFilters, value) => {
      if (!allFlagKey) return nextFilters;
      return { ...nextFilters, [allFlagKey]: formatAllFlag(value) };
    },
    [allFlagKey, formatAllFlag],
  );

  const handleFilterChange = useCallback((eventOrName, value) => {
    if (eventOrName?.target) {
      const { name, value: eventValue } = eventOrName.target;
      setFilters((prev) => ({ ...prev, [name]: eventValue, page: 1 }));
      return;
    }

    setFilters((prev) => ({ ...prev, [eventOrName]: value, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleLimitChange = useCallback(
    (newLimit) => {
      if (newLimit === 'all') {
        setFilters((prev) => applyAllFlag({ ...prev, limit: allLimit, page: 1 }, true));
        return;
      }

      setFilters((prev) =>
        applyAllFlag({ ...prev, limit: parseLimit(newLimit), page: 1 }, false),
      );
    },
    [allLimit, applyAllFlag, parseLimit],
  );

  const clearFilters = useCallback(() => {
    setFilters({ ...initialFilters });
  }, [initialFilters]);

  return {
    filters,
    setFilters,
    handleFilterChange,
    handlePageChange,
    handleLimitChange,
    clearFilters,
  };
};
