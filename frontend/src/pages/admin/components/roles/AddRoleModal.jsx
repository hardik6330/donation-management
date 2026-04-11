import { useState, useEffect } from 'react';
import {
  useAddRoleMutation,
  useUpdateRoleMutation,
} from '../../../../services/roleApi';
import { Shield, Plus, Loader2, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';

const PERM_LEVELS = ['none', 'view', 'entry', 'full'];

const AddRoleModal = ({ isOpen, onClose, editingRole, modules, permColors, parsePerms }) => {
  const [addRole, { isLoading: isAdding }] = useAddRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const [form, setForm] = useState({ name: '', description: '', permissions: {} });

  useEffect(() => {
    if (isOpen) {
      if (editingRole) {
        setForm({ 
          name: editingRole.name, 
          description: editingRole.description || '', 
          permissions: { ...parsePerms(editingRole.permissions) } 
        });
      } else {
        const defaultPerms = {};
        modules.forEach(m => { defaultPerms[m.key] = 'none'; });
        setForm({ name: '', description: '', permissions: defaultPerms });
      }
    }
  }, [editingRole, isOpen, modules, parsePerms]);

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
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save role');
    }
  };

  return (
    <AdminModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingRole ? "Edit Role" : "Create Role"} 
      icon={editingRole ? <Edit /> : <Shield />} 
      maxWidth="max-w-3xl"
    >
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
            {modules.map((m) => (
              <div key={m.key} className="grid grid-cols-5 gap-0 p-3 border-t border-gray-100 items-center">
                <div className="text-sm font-medium text-gray-700">{m.label}</div>
                {PERM_LEVELS.map((level) => (
                  <div key={level} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => handlePermChange(m.key, level)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        form.permissions[m.key] === level
                          ? permColors[level] + ' ring-2 ring-offset-1 ring-current'
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
          <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">Cancel</button>
          <button type="submit" disabled={isAdding || isUpdating} className="flex-[2] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
            {(isAdding || isUpdating) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {editingRole ? "Update Role" : "Create Role"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddRoleModal;
