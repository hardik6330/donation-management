import { useState } from 'react';
import {
  useGetSystemUsersQuery,
  useDeleteSystemUserMutation,
  useGetRolesQuery
} from '../../../../services/apiSlice';
import {
  Search, Edit, Trash2, Shield
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import AddSystemUserModal from './AddSystemUserModal';

const SystemUserList = () => {
  const [filters, setFilters] = useState({
    search: '',
    roleId: '',
    page: 1,
    limit: 10
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { data: usersData, isLoading } = useGetSystemUsersQuery(filters);
  const { data: rolesData } = useGetRolesQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteSystemUserMutation();

  const users = usersData?.data?.rows || [];
  const pagination = {
    currentPage: usersData?.data?.currentPage || 1,
    totalPages: usersData?.data?.totalPages || 1,
    totalData: usersData?.data?.totalData || 0,
    limit: usersData?.data?.limit || 10
  };

  const roles = rolesData?.data || [];
  const roleOptions = roles.map(r => ({ value: r.id, label: r.name }));

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', roleId: '', page: 1, limit: 10 });
  };

  const handlePageChange = (page) => setFilters(prev => ({ ...prev, page }));

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      try {
        await deleteUser(id).unwrap();
        toast.success('User deleted');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete');
      }
    }
  };

  const tableHeaders = [
    { label: 'Name' },
    { label: 'Email' },
    { label: 'Mobile' },
    { label: 'Role' },
    { label: 'Actions' }
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Name, email or mobile...' },
    { name: 'roleId', label: 'Role', type: 'select', icon: Shield, options: roleOptions, placeholder: 'All Roles' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Users"
        subtitle="Manage admin, manager and operator accounts"
        buttonText="Add User"
        onButtonClick={() => { setEditingUser(null); setIsAddModalOpen(true); }}
      />

      <FilterSection filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} fields={filterFields} />

      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No system users found.">
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{user.name}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{user.mobileNumber}</td>
            <td className="px-6 py-4">
              {user.role ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  {user.role.name}
                </span>
              ) : (
                <span className="text-xs text-gray-400">No Role</span>
              )}
            </td>
            <td className="px-6 py-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingUser(user); setIsAddModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(user.id)} disabled={isDeleting} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

      <AddSystemUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} editingUser={editingUser} />
    </div>
  );
};

export default SystemUserList;
