import React from 'react';
import { Building2, Search, Edit, Trash2, MapPin, IndianRupee } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import { getActiveColor, getActiveLabel } from '../../../../utils/tableUtils';

const GaushalaList = ({
  gaushalas,
  cities,
  talukas,
  villages,
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
  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search by name...' },
    {
      name: 'cityId',
      label: 'City',
      type: 'select',
      icon: MapPin,
      options: cities.map(c => ({ value: c.id, label: c.name }))
    },
    {
      name: 'talukaId',
      label: 'Taluka',
      type: 'select',
      icon: MapPin,
      options: talukas.map(t => ({ value: t.id, label: t.name }))
    },
    {
      name: 'villageId',
      label: 'Village',
      type: 'select',
      icon: MapPin,
      options: villages.map(v => ({ value: v.id, label: v.name }))
    },
  ];

  const tableHeaders = [
    { label: 'Gaushala Name' },
    { label: 'City' },
    { label: 'Taluka' },
    { label: 'Village' },
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
        emptyMessage="No gaushalas found."
      >
        {gaushalas.map((gaushala) => (
          <tr key={gaushala.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 font-bold text-gray-800">{gaushala.name}</td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{gaushala.city}</td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{gaushala.taluka}</td>
            <td className="p-4 px-6 text-sm text-gray-500 uppercase">{gaushala.village}</td>
            <td className="p-4 px-6 text-right">
              <div className="text-sm font-bold text-blue-600 flex items-center justify-end gap-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(gaushala.totalDonationAmount || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-gray-400">{gaushala.totalDonations || 0} donations</div>
            </td>
            <td className="p-4 px-6 text-center">
              <span className={`text-xs font-bold uppercase ${getActiveColor(gaushala.isActive)}`}>
                {getActiveLabel(gaushala.isActive)}
              </span>
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2">
                {hasPermission('gaushala', 'entry') && (
                  <button
                    onClick={() => onEdit(gaushala)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('gaushala', 'full') && (
                  <button
                    onClick={() => onDelete(gaushala.id)}
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
            Showing <span className="font-bold text-blue-600">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span> records
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={filters.page === 1}
              onClick={() => onPageChange(filters.page - 1)}
              className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 text-sm font-bold rounded-lg transition ${
                  filters.page === page
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={filters.page === pagination.totalPages}
              onClick={() => onPageChange(filters.page + 1)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaushalaList;
