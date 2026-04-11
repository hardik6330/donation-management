import React from 'react';
import { Search, Edit, Trash2, Shield } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';

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
  onLimitChange,
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
                {hasPermission('users', 'entry') && (
                  <button 
                    onClick={() => onEdit(user)} 
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('users', 'full') && (
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

      <Pagination
        pagination={pagination}
        filters={filters}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
};

export default SystemUserList;
