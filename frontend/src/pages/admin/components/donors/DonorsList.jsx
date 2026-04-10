import React from 'react';
import { Search, Phone, MapPin, MapPinHouse, Building2, IndianRupee } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';

const DonorsList = ({ 
  donors, 
  isLoading, 
  filters, 
  pagination, 
  cityPagination,
  talukaPagination,
  villagePagination,
  onFilterChange, 
  onClearFilters, 
  onPageChange 
}) => {
  const filterFields = [
    { name: 'name', label: 'Donor Name', icon: Search, placeholder: 'Search by name...' },
    { name: 'mobileNumber', label: 'Mobile Number', icon: Phone, placeholder: 'Search by mobile...' },
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
      icon: MapPinHouse,
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
      icon: Building2,
      options: villagePagination.items.map(v => ({ value: v.id, label: v.name })),
      disabled: !filters.talukaId,
      isServerSearch: true,
      onSearchChange: villagePagination.handleSearch,
      onLoadMore: villagePagination.handleLoadMore,
      hasMore: villagePagination.hasMore,
      loading: villagePagination.loading
    },
    { name: 'minAmount', label: 'Min Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 0' },
    { name: 'maxAmount', label: 'Max Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 10000+' },
  ];

  const tableHeaders = [
    { label: 'Donor Info' },
    { label: 'Address' },
    { label: 'City' },
    { label: 'Village' },
    { label: 'Company Name' },
    { label: 'Donations', className: 'text-center' },
    { label: 'Total Amount', className: 'text-right' },
  ];

  return (
    <div className="space-y-6">
      <FilterSection
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        fields={filterFields}
      />

      <AdminTable 
        headers={tableHeaders} 
        isLoading={isLoading}
        emptyMessage="No donors found."
      >
        {donors.map((donor) => (
          <tr key={donor.mobileNumber} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-bold text-gray-800">{donor.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    {donor.mobileNumber}
                  </div>
                </div>
              </div>
            </td>
             <td className="p-4 px-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm text-gray-500 uppercase">{donor.address || '-'}</div>
                </div>
              </div>
            </td>
              <td className="p-4 px-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm text-gray-500 uppercase">{donor.district || '-'}</div>    
                </div>
              </div>
            </td>
              <td className="p-4 px-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm text-gray-500 uppercase">{donor.village || '-'}</div>
                </div>
              </div>
            </td>
              <td className="p-4 px-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm text-gray-500 uppercase">{donor.companyName || '-'}</div>
                </div>
              </div>
            </td>
            <td className="p-2 px-3 text-center">
              <span className="bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                {donor.donationCount}
              </span>
            </td>
            <td className="p-4 px-6 text-right">
              <div className="inline-flex items-center justify-end gap-0.5 text-sm font-bold text-blue-700">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(donor.totalDonated || 0).toLocaleString('en-IN')}
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

export default DonorsList;
