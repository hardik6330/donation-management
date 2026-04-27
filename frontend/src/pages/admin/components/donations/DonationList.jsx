import React, { useState } from 'react';
import { Search, Calendar, IndianRupee, FileDown, MapPin, Building2, Mic2, Tag, CreditCard, Trash2, Edit, PlusCircle, Eye, ChevronDown, ChevronUp, MessageCircle, MessageSquare, Loader2 } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';
import { getStatusColor, getPaymentModeColor, donationStatuses } from '../../../../utils/tableUtils';
import InstallmentTable from './InstallmentTable';

const DonationList = ({
  donations,
  isLoading,
  pagination,
  filters,
  gaushalaPagination,
  kathaPagination,
  categoryPagination,
  onEditPartialPayment,
  onAddPartialPayment,
  onEditPayLater,
  onDownloadSlip, 
  onResendWhatsApp,
  isResending,
  onFilterChange, 
  onClearFilters, 
  onPageChange,
  onLimitChange,
  hasPermission 
}) => {
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const tableHeaders = [
    { label: 'Donor Name' },
    { label: 'Cause / Purpose' },
    { label: 'Gaushala / Katha' },
    { label: 'City / State' },
    { label: 'Reference' },
    { label: 'Mode', className: 'text-center' },
    { label: 'Amount', className: 'text-right' },
    { label: 'Status', className: 'text-center' },
    { label: 'Donation Date' },
    { label: 'Payment Date' },
    
    { label: 'Actions' },
  ];

  const filterFields = [
    { name: 'search', label: 'Search Donor', icon: Search, placeholder: 'Name, Email or Mobile...' },
    { name: 'city', label: 'City', icon: MapPin, placeholder: 'Search by city...' },
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
        ...donationStatuses.map(s => ({ value: s.id, label: s.name })),
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
          <React.Fragment key={donation.id}>
            <tr className={`hover:bg-gray-50 transition ${expandedRowId === donation.id ? 'bg-blue-50/30' : ''}`}>
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
                <div className="text-sm text-gray-700">{donation.donor?.city || '-'}</div>
                <div className="text-[10px] text-gray-400">{donation.donor?.state || ''}</div>
              </td>
              <td className="p-4 px-6 text-sm text-gray-600 italic">
                {donation.referenceName || '-'}
              </td>
              <td className="p-4 px-6 text-center">
                <span className={`text-xs font-bold uppercase ${getPaymentModeColor(donation.paymentMode)}`}>
                  {donation.paymentMode}
                </span>
              </td>
              <td className="p-4 px-6 text-right font-bold">
                <div className="flex items-center justify-end gap-0.5 text-blue-600">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {Number(donation.amount).toLocaleString('en-IN')}
                </div>
                {donation.status === 'partially_paid' && (
                  <div className="mt-1 space-y-0.5">
                    <div className="flex items-center justify-end gap-0.5 text-green-600 text-[10px]">
                      Paid: ₹{Number(donation.paidAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center justify-end gap-0.5 text-orange-600 text-[10px]">
                      Rem: ₹{Number(donation.remainingAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </td>
              <td className="p-4 px-6 text-center">
                <span className={`text-xs font-bold uppercase ${getStatusColor(donation.status)}`}>
                  {donation.status === 'partially_paid' ? 'Partial' : (donation.status === 'pay_later' ? 'Pay Later' : donation.status)}
                </span>
              </td>
              <td className="p-4 px-6 text-sm text-gray-500">
                {new Date(donation.donationDate).toLocaleDateString('en-IN')}
              </td> 
              <td className="p-4 px-6 text-sm text-gray-500">
                {donation.paymentDate 
                  ? new Date(donation.paymentDate).toLocaleDateString('en-IN')
                  : "No Payment Yet"}
              </td>
              <td className="p-4 px-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(donation.id)}
                    className={`p-1.5 rounded-lg transition-colors ${expandedRowId === donation.id ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-100'}`}
                    title="View History"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {donation.status === 'completed' && (
                    <button
                      onClick={() => onDownloadSlip(donation)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        donation.slipUrl 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-gray-300 hover:bg-gray-50 cursor-wait'
                      }`}
                      title={donation.slipUrl ? "Download Slip" : "Slip is being generated..."}
                    >
                      {donation.slipUrl ? (
                        <FileDown className="w-4 h-4" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </button>
                  )}
                  {donation.status === 'completed' && (
                    <button
                      onClick={() => onResendWhatsApp(donation)}
                      disabled={isResending}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Send WhatsApp"
                    >
                      <svg 
                        viewBox="0 0 24 24" 
                        className="w-4 h-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.87 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </button>
                  )}
                  {donation.status === 'partially_paid' && hasPermission('donations', 'entry') && (
                    <button
                      onClick={() => onAddPartialPayment(donation)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Add Partial Payment"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  )}
                  {hasPermission('donations', 'entry') && (
                    <button
                      onClick={() => (donation.status === 'partially_paid' ? onEditPartialPayment(donation) : onEditPayLater(donation))}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Donation"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
            {expandedRowId === donation.id && (
              <tr className="bg-gray-50/30">
                <td colSpan={10} className="p-6 pt-0">
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <InstallmentTable donationId={donation.id} />
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
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
