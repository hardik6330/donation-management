import { useState, useEffect, useCallback, useRef } from 'react';

export const useDropdownPagination = (triggerQuery, options = {}) => {
  const { 
    limit = 20, 
    fields = 'id,name', 
    additionalParams = {}, 
    dataKey = 'data', 
    rowsKey = 'data',
    skip = false,
    searchKey = 'search'
  } = options;

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(search);

  // Update searchRef whenever search changes
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // Use a ref to store additionalParams to avoid unnecessary re-renders
  const paramsRef = useRef(additionalParams);
  useEffect(() => {
    paramsRef.current = additionalParams;
  }, [JSON.stringify(additionalParams)]);

  const fetchItems = useCallback(async (currentPage, currentSearch, append = false) => {
    if (skip) return;
    setLoading(true);
    try {
      const result = await triggerQuery({
        page: currentPage,
        limit,
        [searchKey]: currentSearch,
        fields,
        ...paramsRef.current
      }).unwrap();

      // Race condition check: only update if this response matches the current search
      if (currentSearch !== searchRef.current && !append) {
        return;
      }

      const responseData = result?.[dataKey] || {};
      const newItems = responseData?.[rowsKey] || [];
      const totalPages = responseData?.totalPages || 1;

      if (append) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }
      setHasMore(currentPage < totalPages);
      setPage(currentPage);
    } catch (error) {
      console.error('Error fetching dropdown items:', error);
    } finally {
      setLoading(false);
    }
  }, [triggerQuery, limit, fields, dataKey, rowsKey, skip, searchKey]);

  // Handle search and parameter changes
  useEffect(() => {
    if (!skip) {
      setPage(1);
      fetchItems(1, search, false);
    }
  }, [search, skip, JSON.stringify(additionalParams)]);

  const handleSearch = (val) => {
    setSearch(val);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !skip) {
      fetchItems(page + 1, search, true);
    }
  };

  const reset = () => {
    setSearch('');
    setPage(1);
    setItems([]);
    setHasMore(false);
  };

  return {
    items,
    search,
    hasMore,
    loading,
    handleSearch,
    handleLoadMore,
    reset,
    setItems,
    fetchItems
  };
};
