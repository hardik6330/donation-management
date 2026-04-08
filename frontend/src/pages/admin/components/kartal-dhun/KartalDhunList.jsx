import { useState } from 'react';
import {
  useGetKartalDhunQuery,
  useDeleteKartalDhunMutation
} from '../../../../services/apiSlice';
import {
  Search, Edit, Trash2, Calendar, Music
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import AddKartalDhunModal from './AddKartalDhunModal';

const KartalDhunList = () => {
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const { data: listData, isLoading } = useGetKartalDhunQuery(filters);
  const [deleteRecord, { isLoading: isDeleting }] = useDeleteKartalDhunMutation();

  const records = listData?.data?.rows || [];
  const pagination = {
    currentPage: listData?.data?.currentPage || 1,
    totalPages: listData?.data?.totalPages || 1,
    totalData: listData?.data?.totalData || 0,
    limit: listData?.data?.limit || 10
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', startDate: '', endDate: '', page: 1, limit: 10 });
  };

  const handlePageChange = (page) => setFilters(prev => ({ ...prev, page }));

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      try {
        await deleteRecord(id).unwrap();
        toast.success('Record deleted');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete');
      }
    }
  };

  const tableHeaders = [
    { label: 'Kartal Dhun Name' },
    { label: 'Date' },
    { label: 'Amount (₹)' },
    { label: 'City' },
    { label: 'Taluka' },
    { label: 'Village' },
    { label: 'Actions' }
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search by name...' },
    { name: 'startDate', label: 'From Date', type: 'date', icon: Calendar },
    { name: 'endDate', label: 'To Date', type: 'date', icon: Calendar },
  ];

  const inr = (val) => Number(val).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Kartal Dhun Income"
        subtitle="Track kartal dhun income records"
        buttonText="Add Income"
        onButtonClick={() => { setEditingRecord(null); setIsAddModalOpen(true); }}
      />

      <FilterSection filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} fields={filterFields} />

      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No kartal dhun records found.">
        {records.map((record) => (
          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{record.name}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{record.date ? new Date(record.date).toLocaleDateString('en-IN') : '-'}</td>
            <td className="px-6 py-4 text-sm font-bold text-green-700">{inr(record.amount)}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{record.city || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{record.taluka || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{record.village || '-'}</td>
            <td className="px-6 py-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingRecord(record); setIsAddModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(record.id)} disabled={isDeleting} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {pagination.totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Showing <span className="font-bold">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span>
          </p>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button disabled={pagination.currentPage === 1} onClick={() => handlePageChange(pagination.currentPage - 1)} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition">Prev</button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const p = i + 1;
                if (pagination.totalPages > 5 && (p < pagination.currentPage - 1 || p > pagination.currentPage + 1) && p !== 1 && p !== pagination.totalPages) {
                  if (p === pagination.currentPage - 2 || p === pagination.currentPage + 2) return <span key={p} className="text-gray-400">...</span>;
                  return null;
                }
                return <button key={p} onClick={() => handlePageChange(p)} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-bold transition ${pagination.currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>;
              })}
            </div>
            <button disabled={pagination.currentPage === pagination.totalPages} onClick={() => handlePageChange(pagination.currentPage + 1)} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition">Next</button>
          </div>
        </div>
      )}

      <AddKartalDhunModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} editingRecord={editingRecord} />
    </div>
  );
};

export default KartalDhunList;
