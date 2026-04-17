import React from 'react';

const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
      {[...Array(count)].map((_, index) => (
        <div 
          key={index} 
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="p-3 sm:p-4 bg-gray-100 rounded-xl w-12 h-12 sm:w-14 sm:h-14"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            <div className="h-6 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;
