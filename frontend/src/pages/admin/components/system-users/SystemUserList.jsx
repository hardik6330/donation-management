import React from 'react';
import { Search, Edit, Trash2, Shield } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';

const SystemUserList = ({ 
  users, 
  roles, 
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
  const roleOptions = roles.map(r => ({ value: r.id, label: r.name }));

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
      <FilterSection filters={filters} onFilterChange={onFilterChange} onClearFilters={onClearFilters} fields={filterFields} />

      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No system users found.">
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{user.name}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{user.mobileNumber}</td>
            <td className="px-6 py-4">
              {user.role ? (
                <span className="text-xs font-bold text-purple-600">
                  {user.role.name}
                </span>
              ) : (
                <span className="text-xs text-gray-400">No Role</span>
              )}
            </td>
            <td className="px-6 py-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                {hasPermission('systemUsers', 'entry') && (
                  <button 
                    onClick={() => onEdit(user)} 
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('systemUsers', 'full') && (
                  <button 
                    onClick={() => onDelete(user.id)} 
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
            Showing <span className="font-bold">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span> users
          </p>
          <div className="flex gap-2">
            <button
              disabled={filters.page === 1}
              onClick={() => onPageChange(filters.page - 1)}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={filters.page === pagination.totalPages}
              onClick={() => onPageChange(filters.page + 1)}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemUserList;
