import React, { useState } from 'react';
import { useGetKathasQuery } from '../../../../services/apiSlice';
import { Mic2, Plus, Calendar, MapPin, Loader2, Tag, Search } from 'lucide-react';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import AdminModal from '../../../../components/common/AdminModal';
import FilterSection from '../../../../components/common/FilterSection';
import AddKathaModal from './AddKathaModal';

const KathaList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    kathaName: '',
    page: 1,
    limit: 10
  });

  const { data: kathasData, isLoading } = useGetKathasQuery(filters);
  const allKathas = kathasData?.data?.rows || [];
  const pagination = {
    currentPage: kathasData?.data?.currentPage || 1,
    totalPages: kathasData?.data?.totalPages || 1,
    totalData: kathasData?.data?.totalData || 0,
    limit: kathasData?.data?.limit || 10
  };

  // Client-side filtering for katha name dropdown only
  const kathas = allKathas.filter(k => {
    const matchesName = !filters.kathaName || k.name === filters.kathaName;
    return matchesName;
  });

  const kathaNameOptions = [...new Set(allKathas.map(k => k.name))].sort().map(name => ({
    value: name,
    label: name
  }));

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({ search: '', kathaName: '', page: 1, limit: 10 });
  };

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search by name, city, village...' },
    { name: 'kathaName', label: 'Katha Name', icon: Mic2, type: 'select', options: kathaNameOptions, placeholder: 'All Kathas' },
  ];

  const tableHeaders = [
    { label: 'Katha Name' },
    { label: 'City' },
    { label: 'Taluka' },
    { label: 'Village' },
    { label: 'Dates' },
    { label: 'Status', className: 'text-center' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Katha Management"
        subtitle="Organize and track donations for different kathas"
        buttonText="Add Katha"
        onButtonClick={() => setIsModalOpen(true)}
      />

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        fields={filterFields}
      />

      <AdminTable
        headers={tableHeaders}
        isLoading={isLoading}
        emptyMessage="No kathas found."
      >
        {kathas.map((katha) => (
          <tr key={katha.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 font-bold text-gray-800">{katha.name}</td>
            <td className="p-4 px-6 text-sm text-gray-600">{katha.city || '-'}</td>
            <td className="p-4 px-6 text-sm text-gray-600">{katha.taluka || '-'}</td>
            <td className="p-4 px-6 text-sm text-gray-600">{katha.village || '-'}</td>
            <td className="p-4 px-6">
              <div className="flex flex-col text-xs text-gray-500">
                <span className="font-medium">{katha.startDate ? new Date(katha.startDate).toLocaleDateString() : '-'}</span>
                <span className="text-[10px] opacity-60">to {katha.endDate ? new Date(katha.endDate).toLocaleDateString() : '-'}</span>
              </div>
            </td>
            <td className="p-4 px-6 text-center">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(katha.status)}`}>
                {katha.status}
              </span>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Pagination UI */}
      {pagination.totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Showing <span className="font-bold">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span> records
          </p>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pagination.totalPages > 5 && (pageNum < pagination.currentPage - 1 || pageNum > pagination.currentPage + 1) && pageNum !== 1 && pageNum !== pagination.totalPages) {
                  if (pageNum === pagination.currentPage - 2 || pageNum === pagination.currentPage + 2) {
                    return <span key={pageNum} className="text-gray-400">...</span>;
                  }
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-bold transition ${
                      pagination.currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <AddKathaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default KathaList;
