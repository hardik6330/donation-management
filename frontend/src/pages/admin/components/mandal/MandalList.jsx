import { useState } from 'react';
import {
  useGetMandalsQuery,
  useDeleteMandalMutation,
  useUpdateMandalMutation
} from '../../../../services/apiSlice';
import {
  Search, Edit, Trash2, CheckCircle, XCircle, UsersRound, IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import AddMandalModal from './AddMandalModal';

const MandalList = () => {
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    page: 1,
    limit: 10
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMandal, setEditingMandal] = useState(null);

  const { data: mandalsData, isLoading } = useGetMandalsQuery(filters);
  const [deleteMandal, { isLoading: isDeleting }] = useDeleteMandalMutation();
  const [updateMandal] = useUpdateMandalMutation();

  const mandals = mandalsData?.data?.rows || [];
  const pagination = {
    currentPage: mandalsData?.data?.currentPage || 1,
    totalPages: mandalsData?.data?.totalPages || 1,
    totalData: mandalsData?.data?.totalData || 0,
    limit: mandalsData?.data?.limit || 10
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', isActive: '', page: 1, limit: 10 });
  };

  const handlePageChange = (page) => setFilters(prev => ({ ...prev, page }));

  const handleDelete = async (id) => {
    if (window.confirm('Delete this mandal? All members & payments will be lost.')) {
      try {
        await deleteMandal(id).unwrap();
        toast.success('Mandal deleted');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete');
      }
    }
  };

  const toggleStatus = async (mandal) => {
    try {
      await updateMandal({ id: mandal.id, isActive: !mandal.isActive }).unwrap();
      toast.success(`Mandal ${mandal.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update');
    }
  };

  const tableHeaders = [
    { label: 'Mandal Name' },
    { label: 'Price (₹)' },
    { label: 'Type' },
    { label: 'Members' },
    { label: 'Status' },
    { label: 'Actions' }
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search mandal name...' },
    {
      name: 'isActive', label: 'Status', type: 'select', icon: CheckCircle,
      options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mandal Management"
        subtitle="Manage mandals, members and monthly collections"
        buttonText="Create Mandal"
        onButtonClick={() => { setEditingMandal(null); setIsAddModalOpen(true); }}
      />

      <div className="flex flex-wrap gap-3">
        <NavLink to="/admin/mandal-members" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition text-sm border border-blue-100">
          <UsersRound className="w-4 h-4" /> Members
        </NavLink>
        <NavLink to="/admin/mandal-payments" className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition text-sm border border-green-100">
          <IndianRupee className="w-4 h-4" /> Monthly Collections
        </NavLink>
      </div>

      <FilterSection filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} fields={filterFields} />

      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No mandals found.">
        {mandals.map((mandal) => (
          <tr key={mandal.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{mandal.name}</td>
            <td className="px-6 py-4 text-sm font-semibold text-gray-800">₹{mandal.price || 100}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{mandal.mandalType || '-'}</td>
            <td className="px-6 py-4 text-sm font-bold text-blue-600">{mandal.dataValues?.memberCount ?? mandal.memberCount ?? 0}</td>
            <td className="px-6 py-4">
              <button onClick={() => toggleStatus(mandal)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${mandal.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                {mandal.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {mandal.isActive ? 'Active' : 'Inactive'}
              </button>
            </td>
            <td className="px-6 py-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingMandal(mandal); setIsAddModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(mandal.id)} disabled={isDeleting} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

      <AddMandalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} editingMandal={editingMandal} />
    </div>
  );
};

export default MandalList;
