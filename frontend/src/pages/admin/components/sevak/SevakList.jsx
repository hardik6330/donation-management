import React from 'react';
import {
  Search, Edit, Trash2, MapPin, Landmark, CheckCircle, XCircle
} from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import { getActiveHoverColor } from '../../../../utils/tableUtils';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';

const SevakList = ({ 
  sevaks, 
  isLoading, 
  isDeleting, 
  pagination, 
  filters, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onFilterChange, 
  onClearFilters,
  onPageChange,
  onLimitChange,
  hasPermission 
}) => {
  const tableHeaders = [
    { label: 'Name' },
    { label: 'Mobile' },
    { label: 'City' },
    { label: 'State' },
    { label: 'Status' },
    { label: 'Actions' }
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Name or Mobile...' },
    { name: 'city', label: 'City', icon: Landmark, placeholder: 'Filter by city...' },
    { name: 'state', label: 'State', icon: MapPin, placeholder: 'Filter by state...' },
    { 
      name: 'isActive', 
      label: 'Status', 
      type: 'select', 
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
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
        emptyMessage="No sevaks found."
      >
        {sevaks.map((sevak) => (
          <tr key={sevak.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 font-bold text-gray-800">{sevak.name}</td>
            <td className="p-4 px-6 text-sm text-gray-500">{sevak.mobileNumber}</td>
            <td className="p-4 px-6 text-sm text-gray-500">{sevak.city}</td>
            <td className="p-4 px-6 text-sm text-gray-500">{sevak.state}</td>
            <td className="p-4 px-6">
              <button
                onClick={() => onToggleStatus(sevak)}
                disabled={!hasPermission('sevaks', 'entry')}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase transition ${getActiveHoverColor(sevak.isActive)}`}
              >
                {sevak.isActive ? (
                  <> Active</>
                ) : (
                  <> Inactive</>
                )}
              </button>
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2">
                {hasPermission('sevaks', 'entry') && (
                  <button
                    onClick={() => onEdit(sevak)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('sevaks', 'full') && (
                  <button
                    onClick={() => onDelete(sevak.id)}
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

export default SevakList;
