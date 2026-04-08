import { useState, useEffect, useRef } from 'react';
import {
  useAddSystemUserMutation,
  useUpdateSystemUserMutation,
  useGetRolesQuery
} from '../../../../services/apiSlice';
import { Loader2, Plus, User, Phone, Mail, Lock, Shield } from 'lucide-react';

import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';

const AddSystemUserModal = ({ isOpen, onClose, editingUser = null }) => {
  const [addUser, { isLoading: isAdding }] = useAddSystemUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateSystemUserMutation();
  const { data: rolesData } = useGetRolesQuery();
  const roles = rolesData?.data || [];

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const mobileRef = useRef(null);
  const passwordRef = useRef(null);
  const roleRef = useRef(null);
  const submitRef = useRef(null);

  const [form, setForm] = useState({
    name: '', email: '', mobileNumber: '', password: '',
    roleId: '', roleName: ''
  });
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editingUser) {
        setForm({
          name: editingUser.name || '',
          email: editingUser.email || '',
          mobileNumber: editingUser.mobileNumber || '',
          password: '',
          roleId: editingUser.roleId || '',
          roleName: editingUser.role?.name || '',
        });
      } else {
        setForm({ name: '', email: '', mobileNumber: '', password: '', roleId: '', roleName: '' });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [editingUser, isOpen]);

  useEffect(() => {
    if (isOpen && nameRef.current) nameRef.current.focus();
  }, [isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'mobileNumber') {
      setForm(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
      return;
    }
    if (name === 'roleName') {
      setForm(prev => ({ ...prev, roleName: value, roleId: '' }));
      setActiveDropdown('roleName');
      return;
    }
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.mobileNumber) {
      toast.error('Name, Email and Mobile are required');
      return;
    }
    if (!editingUser && !form.password) {
      toast.error('Password is required for new user');
      return;
    }
    try {
      const payload = {
        name: form.name,
        email: form.email,
        mobileNumber: form.mobileNumber,
        roleId: form.roleId || null,
      };
      if (form.password) payload.password = form.password;

      if (editingUser) {
        await updateUser({ id: editingUser.id, ...payload }).unwrap();
        toast.success('User updated successfully');
      } else {
        await addUser(payload).unwrap();
        toast.success('User created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save user');
    }
  };

  const roleItems = roles.map(r => ({ id: r.id, name: r.name }));
  const isLoading = isAdding || isUpdating;

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={editingUser ? "Edit User" : "Add System User"} icon={<User />}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Full Name" name="name" placeholder="User name" value={form.name} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, emailRef)} inputRef={nameRef} icon={User} required />
          <FormInput label="Email" name="email" type="email" placeholder="user@example.com" value={form.email} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, mobileRef)} inputRef={emailRef} icon={Mail} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Mobile Number" name="mobileNumber" placeholder="10 digit mobile" value={form.mobileNumber} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, passwordRef)} inputRef={mobileRef} icon={Phone} required />
          <FormInput
            label={editingUser ? "New Password (leave blank to keep)" : "Password"}
            name="password"
            type="password"
            placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
            value={form.password}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, roleRef)}
            inputRef={passwordRef}
            icon={Lock}
            required={!editingUser}
          />
        </div>

        <SearchableDropdown
          label="Role"
          name="roleName"
          placeholder="Select Role"
          value={form.roleName}
          items={roleItems}
          onChange={handleChange}
          onSelect={(id, name) => { setForm(prev => ({ ...prev, roleId: id, roleName: name })); setActiveDropdown(null); }}
          onKeyDown={(e) => handleKeyDown(e, submitRef)}
          isActive={activeDropdown === 'roleName'}
          setActive={setActiveDropdown}
          inputRef={roleRef}
          icon={Shield}
        />

        <div className="pt-4 flex items-center gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">Cancel</button>
          <button ref={submitRef} type="submit" disabled={isLoading} className="flex-[2] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {editingUser ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddSystemUserModal;
