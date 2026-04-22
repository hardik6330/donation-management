import { useState, useEffect, useRef } from 'react';
import {
  useAddMandalMemberMutation,
  useUpdateMandalMemberMutation,
  useGetMandalsQuery
} from '../../../../services/mandalApi';
import { Loader2, Plus, User, Phone, UsersRound, MapPin, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';

const AddMemberModal = ({ isOpen, onClose, editingMember = null, cityPagination }) => {
  const [addMember, { isLoading: isAdding }] = useAddMandalMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateMandalMemberMutation();
  const { data: mandalsData } = useGetMandalsQuery({ fetchAll: 'true', isActive: 'true' });
  
  const mandals = mandalsData?.data?.items || [];
  const cities = cityPagination.items;

  const nameRef = useRef(null);
  const mobileRef = useRef(null);
  const mandalRef = useRef(null);
  const cityRef = useRef(null);
  const submitRef = useRef(null);

  const [form, setForm] = useState({ name: '', mobileNumber: '', mandalId: '', mandalName: '', city: '', isActive: true });
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editingMember) {
        setForm({
          name: editingMember.name || '',
          mobileNumber: editingMember.mobileNumber || '',
          mandalId: editingMember.mandalId || '',
          mandalName: editingMember.mandal?.name || '',
          city: editingMember.city || '',
          isActive: editingMember.isActive ?? true,
        });
      } else {
        setForm({ name: '', mobileNumber: '', mandalId: '', mandalName: '', city: '', isActive: true });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [editingMember, isOpen]);

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
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
      return;
    }
    if (name === 'mobileNumber') {
      setForm(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
      return;
    }
    if (name === 'mandalName') {
      setForm(prev => ({ ...prev, mandalName: value, mandalId: '' }));
      setActiveDropdown('mandalName');
      return;
    }
    if (name === 'city') {
      setForm(prev => ({ ...prev, city: value }));
      setActiveDropdown('city');
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobileNumber || !form.mandalId) {
      toast.error('Name, Mobile and Mandal are required');
      return;
    }
    try {
      const payload = { 
        name: form.name, 
        mobileNumber: form.mobileNumber, 
        mandalId: form.mandalId,
        city: form.city,
        isActive: form.isActive
      };
      if (editingMember) {
        await updateMember({ id: editingMember.id, ...payload }).unwrap();
        toast.success('Member updated');
      } else {
        await addMember(payload).unwrap();
        toast.success('Member added');
      }
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save member');
    }
  };

  const mandalItems = mandals.map(m => ({ id: m.id, name: m.name }));
  const isLoading = isAdding || isUpdating;

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={editingMember ? "Edit Member" : "Add Member"} icon={editingMember ? <Edit /> : <User />}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Full Name" name="name" placeholder="Member name" value={form.name} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, mobileRef)} inputRef={nameRef} icon={User} required />
        <FormInput label="Mobile Number" name="mobileNumber" placeholder="10 digit mobile" value={form.mobileNumber} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, mandalRef)} inputRef={mobileRef} icon={Phone} required />
        <div className="grid grid-cols-2 gap-4">
          <SearchableDropdown
            label="Mandal"
            name="mandalName"
            placeholder="Select Mandal"
            value={form.mandalName}
            items={mandalItems}
            onChange={handleChange}
            onSelect={(id, name) => { setForm(prev => ({ ...prev, mandalId: id, mandalName: name })); setActiveDropdown(null); }}
            onKeyDown={(e) => handleKeyDown(e, cityRef)}
            isActive={activeDropdown === 'mandalName'}
            setActive={setActiveDropdown}
            inputRef={mandalRef}
            icon={UsersRound}
            allowTransliteration={false}
          />
          <SearchableDropdown
            label="Location (City)"
            name="city"
            placeholder="Select City"
            value={form.city}
            items={cities}
            onChange={(e) => {
              setForm(prev => ({ ...prev, city: e.target.value }));
              setActiveDropdown('city');
              cityPagination.handleSearch(e.target.value);
            }}
            onSelect={(id, name) => { 
              setForm(prev => ({ ...prev, city: name })); 
              setActiveDropdown(null); 
            }}
            onKeyDown={(e) => handleKeyDown(e, submitRef)}
            isActive={activeDropdown === 'city'}
            setActive={setActiveDropdown}
            inputRef={cityRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={cityPagination.handleLoadMore}
            hasMore={cityPagination.hasMore}
            loading={cityPagination.loading}
            allowTransliteration={false}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
          <div className="flex items-center h-[42px]">
            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                name="isActive"
                className="sr-only peer"
                checked={form.isActive}
                onChange={handleChange}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className={`ms-3 text-sm font-bold transition ${form.isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {form.isActive ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>
        </div>
        <div className="pt-4 flex items-center gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">Cancel</button>
          <button ref={submitRef} type="submit" disabled={isLoading} className="flex-[2] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {editingMember ? "Update Member" : "Add Member"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddMemberModal;
