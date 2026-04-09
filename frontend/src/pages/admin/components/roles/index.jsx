import React, { useState } from 'react';
import RoleList from './RoleList';
import AddRoleModal from './AddRoleModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetRolesQuery, useDeleteRoleMutation } from '../../../../services/apiSlice';
import { toast } from 'react-toastify';

const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'donations', label: 'Donations' },
  { key: 'donors', label: 'Donors' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'sevaks', label: 'Sevaks' },
  { key: 'gaushala', label: 'Gaushala' },
  { key: 'katha', label: 'Katha' },
  { key: 'mandal', label: 'Mandal' },
  { key: 'kartalDhun', label: 'Kartal Dhun' },
  { key: 'bapuSchedule', label: 'Bapu Schedule' },
  { key: 'category', label: 'Category' },
  { key: 'location', label: 'Location' },
  { key: 'users', label: 'Users & Roles' },
];

const PERM_COLORS = {
  none: 'bg-gray-100 text-gray-500 border border-gray-200',
  view: 'bg-blue-50 text-blue-700 border border-blue-200',
  entry: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  full: 'bg-green-50 text-green-700 border border-green-200',
};

const parsePerms = (perms) => {
  if (!perms) return {};
  if (typeof perms === 'string') {
    try { return JSON.parse(perms); } catch { return {}; }
  }
  return perms;
};

const Roles = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // API calls
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const roles = rolesData?.data || [];

  const handleAdd = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this role?')) {
      try {
        await deleteRole(id).unwrap();
        toast.success('Role deleted');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Roles & Permissions" 
        subtitle="Manage user roles and module access"
        buttonText={hasPermission('users', 'entry') ? "Create Role" : null}
        onButtonClick={handleAdd}
      />

      <RoleList 
        roles={roles}
        modules={MODULES}
        permColors={PERM_COLORS}
        parsePerms={parsePerms}
        isLoading={rolesLoading}
        isDeleting={isDeleting}
        onEdit={handleEdit} 
        onDelete={handleDelete}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddRoleModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingRole={editingRole}
          modules={MODULES}
          permColors={PERM_COLORS}
          parsePerms={parsePerms}
          key={editingRole?.id || 'new'}
        />
      )}
    </div>
  );
};

export default Roles;
