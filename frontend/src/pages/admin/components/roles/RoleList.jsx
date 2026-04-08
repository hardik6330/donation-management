import { useState } from 'react';
import {
  useGetRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation
} from '../../../../services/apiSlice';
import { Shield, Plus, Edit, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import AdminModal from '../../../../components/common/AdminModal';

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

const PERM_LEVELS = ['none', 'view', 'entry', 'full'];
const PERM_COLORS = {
  none: 'bg-gray-100 text-gray-500',
  view: 'bg-blue-100 text-blue-700',
  entry: 'bg-yellow-100 text-yellow-700',
  full: 'bg-green-100 text-green-700',
};

const RoleList = () => {
  const { data: rolesData, isLoading } = useGetRolesQuery();
  const [addRole, { isLoading: isAdding }] = useAddRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', permissions: {} });

  const roles = rolesData?.data || [];

  const parsePerms = (perms) => {
    if (!perms) return {};
    if (typeof perms === 'string') {
      try { return JSON.parse(perms); } catch { return {}; }
    }
    return perms;
  };

  const openModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setForm({ name: role.name, description: role.description || '', permissions: { ...parsePerms(role.permissions) } });
    } else {
      setEditingRole(null);
      const defaultPerms = {};
      MODULES.forEach(m => { defaultPerms[m.key] = 'none'; });
      setForm({ name: '', description: '', permissions: defaultPerms });
    }
    setIsModalOpen(true);
  };

  const handlePermChange = (module, level) => {
    setForm(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [module]: level }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Role name is required'); return; }
    try {
      if (editingRole) {
        await updateRole({ id: editingRole.id, ...form }).unwrap();
        toast.success('Role updated');
      } else {
        await addRole(form).unwrap();
        toast.success('Role created');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save role');
    }
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

  const tableHeaders = [
    { label: 'Role Name' },
    { label: 'Description' },
    { label: 'Permissions' },
    { label: 'Actions' }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Roles & Permissions"
        subtitle="Manage user roles and module access"
        buttonText="Create Role"
        onButtonClick={() => openModal()}
      />

      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No roles found.">
        {roles.map((role) => (
          <tr key={role.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-bold text-gray-900">{role.name}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{role.description || '-'}</td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-1">
                {MODULES.slice(0, 5).map(m => {
                  const perms = parsePerms(role.permissions);
                  const perm = perms?.[m.key] || 'none';
                  return (
                    <span key={m.key} className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${PERM_COLORS[perm]}`}>
                      {m.label}: {perm}
                    </span>
                  );
                })}
                {MODULES.length > 5 && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-gray-400 bg-gray-50">
                    +{MODULES.length - 5} more
                  </span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <button onClick={() => openModal(role)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(role.id)} disabled={isDeleting} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Role Modal */}
      {isModalOpen && (
        <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? "Edit Role" : "Create Role"} icon={<Shield />} maxWidth="max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Role Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="E.g. Manager"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Role description"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Permissions Grid */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Module Permissions</label>
              <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-5 gap-0 p-3 bg-gray-100 text-[10px] font-bold text-gray-500 uppercase">
                  <div>Module</div>
                  <div className="text-center">None</div>
                  <div className="text-center">View</div>
                  <div className="text-center">Entry</div>
                  <div className="text-center">Full</div>
                </div>
                {MODULES.map((m) => (
                  <div key={m.key} className="grid grid-cols-5 gap-0 p-3 border-t border-gray-100 items-center">
                    <div className="text-sm font-medium text-gray-700">{m.label}</div>
                    {PERM_LEVELS.map((level) => (
                      <div key={level} className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => handlePermChange(m.key, level)}
                          className={`w-7 h-7 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            form.permissions[m.key] === level
                              ? PERM_COLORS[level] + ' ring-2 ring-offset-1 ring-current'
                              : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {level[0].toUpperCase()}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">Cancel</button>
              <button type="submit" disabled={isAdding || isUpdating} className="flex-[2] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
                {(isAdding || isUpdating) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {editingRole ? "Update Role" : "Create Role"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
};

export default RoleList;
