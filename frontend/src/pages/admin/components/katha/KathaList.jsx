import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Edit, Trash2, MapPin, IndianRupee } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';
import { getStatusColor } from '../../../../utils/tableUtils';

const KathaList = ({
  kathas,
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
  const navigate = useNavigate();

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search by name...' },
    { name: 'city', label: 'City', icon: MapPin, placeholder: 'Search by city...' },
    { name: 'state', label: 'State', icon: MapPin, placeholder: 'Search by state...' },
  ];

  const tableHeaders = [
    { label: 'Katha Name' },
    { label: 'State' },
    { label: 'City' },
    { label: 'Dates' },
    { label: 'Total Donations', className: 'text-right' },
    { label: 'Status', className: 'text-center' },
    { label: 'Actions' },
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
        emptyMessage="No kathas found."
      >
        {kathas.map((katha) => (
          <tr
            key={katha.id}
            className="hover:bg-blue-50/50 transition cursor-pointer"
            onClick={() => navigate(`/admin/donations?kathaId=${katha.id}`)}
          >
            <td className="p-4 px-6 font-bold text-gray-800">{katha.name}</td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{katha.state}</td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{katha.city}</td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(katha.startDate).toLocaleDateString('en-IN')} - {new Date(katha.endDate).toLocaleDateString('en-IN')}
              </div>
            </td>
            <td className="p-4 px-6 text-right">
              <div className="text-sm font-bold text-blue-600 flex items-center justify-end gap-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(katha.totalDonationAmount || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-gray-400">{katha.totalDonations || 0} donations</div>
            </td>
            <td className="p-4 px-6 text-center">
              <span className={`text-xs font-bold uppercase ${getStatusColor(katha.status)}`}>
                {katha.status}
              </span>
            </td>
            <td className="p-4 px-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                {hasPermission('katha', 'entry') && (
                  <button
                    onClick={() => onEdit(katha)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('katha', 'full') && (
                  <button
                    onClick={() => onDelete(katha.id)}
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

export default KathaList;
