import React, { useState } from 'react';
import SystemUserList from './SystemUserList';
import AddSystemUserModal from './AddSystemUserModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetSystemUsersQuery, useDeleteSystemUserMutation, useGetRolesQuery } from '../../../../services/apiSlice';
import { toast } from 'react-toastify';

const SystemUser = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    roleId: '',
    page: 1,
    limit: 10
  });

  // API calls moved to index.jsx
  const { data: usersData, isLoading: loading } = useGetSystemUsersQuery(filters);
  const { data: rolesData } = useGetRolesQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteSystemUserMutation();

  const users = usersData?.data?.rows || [];
  const roles = rolesData?.data || [];
  const pagination = {
    currentPage: usersData?.data?.currentPage || 1,
    totalPages: usersData?.data?.totalPages || 1,
    totalData: usersData?.data?.totalData || 0,
    limit: usersData?.data?.limit || 10
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', roleId: '', page: 1, limit: 10 });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="System Users" 
        subtitle="Manage admin, manager and operator accounts"
        buttonText={hasPermission('systemUsers', 'entry') ? "Add User" : null}
        onButtonClick={handleAdd}
      />

      <SystemUserList 
        users={users}
        roles={roles}
        isLoading={loading}
        isDeleting={isDeleting}
        pagination={pagination}
        filters={filters}
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddSystemUserModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingUser={editingUser}
          key={editingUser?.id || 'new'}
        />
      )}
    </div>
  );
};

export default SystemUser;
