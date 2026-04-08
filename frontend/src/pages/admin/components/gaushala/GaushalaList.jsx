import React, { useState } from 'react';
import { useGetGaushalasQuery } from '../../../../services/apiSlice';
import { Building2, Plus, MapPin, Loader2, Search, X } from 'lucide-react';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import AdminModal from '../../../../components/common/AdminModal';
import FilterSection from '../../../../components/common/FilterSection';
import AddGaushalaModal from './AddGaushalaModal';

const GaushalaList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    gaushalaName: '',
    page: 1,
    limit: 10
  });

  const { data: gaushalasData, isLoading } = useGetGaushalasQuery(filters);
  const allGaushalas = gaushalasData?.data?.rows || [];
  const pagination = {
    currentPage: gaushalasData?.data?.currentPage || 1,
    totalPages: gaushalasData?.data?.totalPages || 1,
    totalData: gaushalasData?.data?.totalData || 0,
    limit: gaushalasData?.data?.limit || 10
  };

  // Client-side filtering for gaushala name dropdown only
  const gaushalas = allGaushalas.filter(g => {
    const matchesName = !filters.gaushalaName || g.name === filters.gaushalaName;
    return matchesName;
  });

  const gaushalaNameOptions = [...new Set(allGaushalas.map(g => g.name))].sort().map(name => ({
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
    setFilters({ search: '', gaushalaName: '', page: 1, limit: 10 });
  };

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search by name, city, village...' },
    { name: 'gaushalaName', label: 'Gaushala Name', icon: Building2, type: 'select', options: gaushalaNameOptions, placeholder: 'All Gaushalas' },
  ];

  const tableHeaders = [
    { label: 'Gaushala Name' },
    { label: 'City' },
    { label: 'Taluka' },
    { label: 'Village' },
    { label: 'Status', className: 'text-center' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gaushala Management"
        subtitle="Manage different gaushalas for donation tracking"
        buttonText="Add Gaushala"
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
        emptyMessage="No gaushalas found."
      >
        {gaushalas.map((gaushala) => (
          <tr key={gaushala.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 font-bold text-gray-800">{gaushala.name}</td>
            <td className="p-4 px-6 text-sm text-gray-600">{gaushala.city || '-'}</td>
            <td className="p-4 px-6 text-sm text-gray-600">{gaushala.taluka || '-'}</td>
            <td className="p-4 px-6 text-sm text-gray-600">{gaushala.village || '-'}</td>
            <td className="p-4 px-6 text-center">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                gaushala.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }`}>
                {gaushala.isActive ? 'Active' : 'Inactive'}
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
        <AddGaushalaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GaushalaList;
