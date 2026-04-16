import React from 'react';
import { Edit, Trash2, Search } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';

const LocationList = ({
  locations,
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
    { label: 'City' },
    { label: 'State' },
    { label: 'Country' },
    { label: 'Actions' },
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search city...' },
  ];

  return (
    <div className="space-y-6">
      <FilterSection
        fields={filterFields}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />

      <AdminTable
        headers={tableHeaders}
        isLoading={isLoading}
        emptyMessage="No locations found."
      >
        {locations.map((location) => (
          <tr key={location.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 font-bold text-gray-800 capitalize">{location.name}</td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{location.stateName || '-'}</td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{location.countryName || '-'}</td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2">
                {hasPermission('location', 'entry') && (
                  <button
                    onClick={() => onEdit(location)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('location', 'full') && (
                  <button
                    onClick={() => onDelete(location.id)}
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

export default LocationList;
