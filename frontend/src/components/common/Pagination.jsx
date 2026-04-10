import React, { useState } from 'react';
import SearchableDropdown from './SearchableDropdown';

const Pagination = ({
  pagination,
  filters,
  onPageChange,
  onLimitChange
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  if (!pagination || pagination.totalData === 0) return null;
  const { totalPages, totalData } = pagination;
  const { limit, page, fetchAll } = filters;

  const limitOptions = [
    { id: 10, name: '10' },
    { id: 20, name: '20' },
    { id: 50, name: '50' },
    { id: 100, name: '100' },
    { id: 'all', name: '100+' },
  ];

  const currentLabel = fetchAll ? '100+' : limit.toString();

  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-bold text-blue-600">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-800">{Math.min(page * limit, totalData)}</span> of <span className="font-bold text-gray-800">{totalData}</span> records
        </p>
        
        {/* Searchable Limit Dropdown */}
        <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase">Show</span>
          <div className="w-20">
            <SearchableDropdown
              name="limit"
              value={activeDropdown === 'limit' ? searchValue : currentLabel}
              placeholder={currentLabel}
              items={limitOptions}
              showClear={false}
              onChange={(e) => setSearchValue(e.target.value)}
              onSelect={(id) => {
                onLimitChange(id);
                setSearchValue('');
                setActiveDropdown(null);
              }}
              isActive={activeDropdown === 'limit'}
              setActive={(name) => {
                if (name === 'limit') {
                  setSearchValue('');
                }
                setActiveDropdown(name);
              }}
            />
          </div>
        </div>
      </div>
      
      {totalPages > 1 && !fetchAll && (
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 text-sm font-bold rounded-lg transition ${
                page === p
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
