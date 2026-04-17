import React from 'react';
import {
  Search, Edit, Trash2, Calendar, MapPin, IndianRupee
} from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';

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
  onLimitChange,
  hasPermission 
}) => {
  const tableHeaders = [
    { label: 'Dhun Mandal Name' },
    { label: 'Date' },
    { label: 'Amount (₹)', className: 'text-right' },
    { label: 'City' },
    { label: 'State' },
    { label: 'Country' },
    { label: 'Actions' }
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search by name...' },
    { name: 'city', label: 'City', icon: MapPin, placeholder: 'Search by city...' },
    { name: 'startDate', label: 'From Date', type: 'date', icon: Calendar },
    { name: 'endDate', label: 'To Date', type: 'date', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <FilterSection 
        fields={filterFields} 
        filters={filters} 
        onFilterChange={onFilterChange} 
        onClearFilters={onClearFilters} 
      />

      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No dhun mandal records found.">
        {records.map((record) => (
          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{record.name}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{record.date ? new Date(record.date).toLocaleDateString('en-IN') : '-'}</td>
            <td className="px-6 py-4 text-right">
              <div className="inline-flex items-center justify-end gap-0.5 text-sm font-bold text-blue-700">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(record.amount || 0).toLocaleString('en-IN')}
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 uppercase">{record.city || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-500 uppercase">{record.state || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-500 uppercase">{record.country || '-'}</td>
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

      <Pagination 
        pagination={pagination}
        filters={filters}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
};

export default KartalDhunList;
