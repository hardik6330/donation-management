import React from 'react';
import {
  Search, Edit, Trash2, Calendar, MapPin
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
  cityPagination,
  talukaPagination,
  villagePagination,
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
    { label: 'Amount (₹)' },
    { label: 'City' },
    { label: 'Taluka' },
    { label: 'Village' },
    { label: 'Actions' }
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search by name...' },
    { 
      name: 'cityId', 
      label: 'City', 
      type: 'select', 
      icon: MapPin,
      options: cityPagination.items.map(c => ({ value: c.id, label: c.name })),
      isServerSearch: true,
      onSearchChange: cityPagination.handleSearch,
      onLoadMore: cityPagination.handleLoadMore,
      hasMore: cityPagination.hasMore,
      loading: cityPagination.loading
    },
    { 
      name: 'talukaId', 
      label: 'Taluka', 
      type: 'select', 
      icon: MapPin,
      options: talukaPagination.items.map(t => ({ value: t.id, label: t.name })),
      disabled: !filters.cityId,
      isServerSearch: true,
      onSearchChange: talukaPagination.handleSearch,
      onLoadMore: talukaPagination.handleLoadMore,
      hasMore: talukaPagination.hasMore,
      loading: talukaPagination.loading
    },
    { 
      name: 'villageId', 
      label: 'Village', 
      type: 'select', 
      icon: MapPin,
      options: villagePagination.items.map(v => ({ value: v.id, label: v.name })),
      disabled: !filters.talukaId,
      isServerSearch: true,
      onSearchChange: villagePagination.handleSearch,
      onLoadMore: villagePagination.handleLoadMore,
      hasMore: villagePagination.hasMore,
      loading: villagePagination.loading
    },
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
            <td className="px-6 py-4 text-sm text-gray-500 uppercase">{record.city || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-500 uppercase">{record.taluka || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-500 uppercase">{record.village || '-'}</td>
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
