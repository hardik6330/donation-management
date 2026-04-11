import React from 'react';
import { Edit, Trash2, Eye, Search } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';

const LocationList = ({
  locations,
  isLoading,
  isDeleting,
  currentLevel,
  canDrillDown,
  pagination,
  filters,
  onView,
  onEdit,
  onDelete,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onLimitChange,
  hasPermission
}) => {
  const levelLabel = {
    city: 'City',
    taluka: 'Taluka',
    village: 'Village',
  };

  const tableHeaders = [
    { label: `${levelLabel[currentLevel]} Name` },
    { label: 'Type' },
    { label: 'Actions' },
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: `Search ${levelLabel[currentLevel]}...` },
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
        emptyMessage={`No ${currentLevel === 'city' ? 'cities' : currentLevel === 'taluka' ? 'talukas' : 'villages'} found.`}
      >
        {locations.map((location) => (
          <tr key={location.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 font-bold text-gray-800 capitalize">{location.name}</td>
            <td className="p-4 px-6 text-xs font-bold text-gray-500 uppercase">{location.type}</td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2">
                {canDrillDown && (
                  <button
                    onClick={() => onView(location)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title={`View ${currentLevel === 'city' ? 'Talukas' : 'Villages'}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
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
