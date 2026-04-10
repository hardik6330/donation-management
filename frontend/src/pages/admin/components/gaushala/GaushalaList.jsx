import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Edit, Trash2, MapPin, IndianRupee } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';
import { getActiveColor, getActiveLabel } from '../../../../utils/tableUtils';

const GaushalaList = ({
  gaushalas,
  cityPagination,
  talukaPagination,
  villagePagination,
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
          <tr
            key={gaushala.id}
            className="hover:bg-blue-50/50 transition cursor-pointer"
            onClick={() => navigate(`/admin/donations?gaushalaId=${gaushala.id}`)}
          >
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
            <td className="p-4 px-6" onClick={(e) => e.stopPropagation()}>
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

      {(pagination.totalPages > 1 || pagination.totalData > filters.limit) && (
        <Pagination
          pagination={pagination}
          filters={filters}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
};

export default GaushalaList;
