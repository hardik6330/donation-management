import React from 'react';

const TableSkeleton = ({ columns = 5, rows = 5 }) => {
  return (
    <div className="w-full animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header Skeleton */}
      <div className="bg-gray-50/50 border-b border-gray-100 flex p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 h-4 bg-gray-200 rounded-md mx-2"></div>
        ))}
      </div>

      {/* Rows Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-gray-50 last:border-0 flex p-4 items-center">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 h-5 bg-gray-100 rounded-md mx-2"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
