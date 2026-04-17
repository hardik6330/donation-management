import React, { useState } from 'react';
import SystemUserList from './SystemUserList';
import AddSystemUserModal from './AddSystemUserModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetSystemUsersQuery, useDeleteSystemUserMutation } from '../../../../services/authApi';
import { useGetRolesQuery } from '../../../../services/roleApi';
import { useTable } from '../../../../hooks/useTable';
import { toast } from 'react-toastify';

const SystemUser = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const initialFilters = {
    search: '',
    roleId: '',
    page: 1,
    limit: 10
  };
  const { filters, handleFilterChange, clearFilters, handlePageChange, handleLimitChange } = useTable({
    initialFilters,
    allFlagKey: 'fetchAll', 
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

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(deletingId).unwrap();
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="System Users" 
        subtitle="Manage admin, manager and operator accounts"
        buttonText={hasPermission('users', 'entry') ? "Add User" : null}
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
        onLimitChange={handleLimitChange}
        hasPermission={hasPermission} 
      />

      <AddSystemUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingUser={editingUser}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
};

export default SystemUser;
