import React from 'react';
import { Search, Calendar, IndianRupee, FileDown, MapPin, Building2, Mic2, Tag, CreditCard, Trash2 } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';
import { getStatusColor, getPaymentModeColor } from '../../../../utils/tableUtils';

const DonationList = ({
  donations,
  isLoading,
  pagination,
  filters,
  cityPagination,
  talukaPagination,
  villagePagination,
  gaushalaPagination,
  kathaPagination,
  categoryPagination,
  onDelete,
  onDownloadSlip, 
  onFilterChange, 
  onClearFilters, 
  onPageChange,
  onLimitChange,
  hasPermission 
}) => {
  const tableHeaders = [
    { label: 'Donor Name' },
    { label: 'Cause / Purpose' },
    { label: 'Gaushala / Katha' },
    { label: 'Village / District' },
    { label: 'Reference' },
    { label: 'Mode', className: 'text-center' },
    { label: 'Amount', className: 'text-right' },
    { label: 'Status', className: 'text-center' },
    { label: 'Payment Date' },
    { label: 'Actions' },
  ];

  const filterFields = [
    { name: 'search', label: 'Search Donor', icon: Search, placeholder: 'Name, Email or Mobile...' },
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
    {
      name: 'gaushalaId',
      label: 'Gaushala',
      type: 'select',
      icon: Building2,
      options: gaushalaPagination.items.map(g => ({ value: g.id, label: g.name })),
      isServerSearch: true,
      onSearchChange: gaushalaPagination.handleSearch,
      onLoadMore: gaushalaPagination.handleLoadMore,
      hasMore: gaushalaPagination.hasMore,
      loading: gaushalaPagination.loading
    },
    {
      name: 'kathaId',
      label: 'Katha',
      type: 'select',
      icon: Mic2,
      options: kathaPagination.items.map(k => ({ value: k.id, label: k.name })),
      isServerSearch: true,
      onSearchChange: kathaPagination.handleSearch,
      onLoadMore: kathaPagination.handleLoadMore,
      hasMore: kathaPagination.hasMore,
      loading: kathaPagination.loading
    },
    {
      name: 'categoryId',
      label: 'Category',
      type: 'select',
      icon: Tag,
      options: categoryPagination.items.map(c => ({ value: c.id, label: c.name })),
      isServerSearch: true,
      onSearchChange: categoryPagination.handleSearch,
      onLoadMore: categoryPagination.handleLoadMore,
      hasMore: categoryPagination.hasMore,
      loading: categoryPagination.loading
    },
    { name: 'startDate', label: 'From Date', type: 'date', icon: Calendar },
    { name: 'endDate', label: 'To Date', type: 'date', icon: Calendar },
    { name: 'minAmount', label: 'Min Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 0' },
    { name: 'maxAmount', label: 'Max Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 10000+' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      icon: CreditCard,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' }
      ]
    },
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
        emptyMessage="No donations found."
      >
        {donations.map((donation) => (
          <tr key={donation.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6">
              <div className="text-sm font-bold text-gray-800">{donation.donor?.name || 'Anonymous'}</div>
              <div className="text-[10px] text-gray-400">{donation.donor?.email || ''}</div>
            </td>
            <td className="p-4 px-6">
              <div className="text-sm text-gray-700 font-medium line-clamp-2">{donation.cause || 'General Donation'}</div>
            </td>
            <td className="p-4 px-6">
              {donation.gaushala?.name ? (
                <span className="text-xs font-bold text-green-600 uppercase">Gaushala: {donation.gaushala.name}</span>
              ) : donation.katha?.name ? (
                <span className="text-xs font-bold text-purple-600 uppercase">Katha: {donation.katha.name}</span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
            <td className="p-4 px-6">
              <div className="text-sm text-gray-700">{donation.donor?.village || '-'}</div>
              <div className="text-[10px] text-gray-400">{donation.donor?.district || ''}</div>
            </td>
            <td className="p-4 px-6 text-sm text-gray-600 italic">
              {donation.referenceName || '-'}
            </td>
            <td className="p-4 px-6 text-center">
              <span className={`text-xs font-bold uppercase ${getPaymentModeColor(donation.paymentMode)}`}>
                {donation.paymentMode}
              </span>
            </td>
            <td className="p-4 px-6 text-right text-blue-600 font-bold">
              <div className="flex items-center justify-end gap-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(donation.amount).toLocaleString('en-IN')}
              </div>
            </td>
            <td className="p-4 px-6 text-center">
              <span className={`text-xs font-bold uppercase ${getStatusColor(donation.status)}`}>
                {donation.status}
              </span>
            </td>
            <td className="p-4 px-6 text-sm text-gray-500">
              {new Date(donation.paymentDate || donation.createdAt).toLocaleDateString('en-IN')}
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2">
                {donation.slipUrl && (
                  <button
                    onClick={() => onDownloadSlip(donation)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Download Slip"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                )}
                {/* {hasPermission('donations', 'full') && (
                  <button
                    onClick={() => onDelete(donation.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )} */}
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

export default DonationList;
