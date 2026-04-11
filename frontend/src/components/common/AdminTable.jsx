import React from 'react';
import TableSkeleton from './TableSkeleton';

const AdminTable = ({ headers, children, isLoading, emptyMessage = "No records found." }) => {
  if (isLoading) {
    return <TableSkeleton columns={headers.length} rows={8} />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px] sm:min-w-0">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-[10px] sm:text-xs uppercase">
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className={`p-4 px-6 font-bold ${header.className || ''}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {children.length > 0 ? (
              children
            ) : (
              <tr>
                <td colSpan={headers.length} className="p-12 text-center text-gray-500 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
