import React from 'react';
import {
  Search, Edit, Trash2, Calendar
} from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';

const KartalDhunList = ({ 
  records, 
  isLoading, 
  isDeleting, 
  pagination, 
  filters, 
  onEdit, 
  onDelete, 
  onFilterChange, 
  onClearFilters, 
  onPageChange,
  hasPermission 
}) => {
  const tableHeaders = [
    { label: 'Kartal Dhun Name' },
    { label: 'Date' },
    { label: 'Amount (₹)' },
    { label: 'City' },
    { label: 'Taluka' },
    { label: 'Village' },
    { label: 'Actions' }
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search by name...' },
    { name: 'startDate', label: 'From Date', type: 'date', icon: Calendar },
    { name: 'endDate', label: 'To Date', type: 'date', icon: Calendar },
  ];

  const inr = (val) => Number(val).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <FilterSection 
        fields={filterFields} 
        filters={filters} 
        onFilterChange={onFilterChange} 
        onClearFilters={onClearFilters} 
      />

      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No kartal dhun records found.">
        {records.map((record) => (
          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{record.name}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{record.date ? new Date(record.date).toLocaleDateString('en-IN') : '-'}</td>
            <td className="px-6 py-4 text-sm font-bold text-green-700">{inr(record.amount)}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{record.city || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{record.taluka || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{record.village || '-'}</td>
            <td className="px-6 py-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                {hasPermission('kartalDhun', 'entry') && (
                  <button 
                    onClick={() => onEdit(record)} 
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('kartalDhun', 'full') && (
                  <button 
                    onClick={() => onDelete(record.id)} 
                    disabled={isDeleting}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">
            Showing <span className="font-bold">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span> records
          </p>
          <div className="flex gap-2">
            <button
              disabled={filters.page === 1}
              onClick={() => onPageChange(filters.page - 1)}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={filters.page === pagination.totalPages}
              onClick={() => onPageChange(filters.page + 1)}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KartalDhunList;
