import { useState, useEffect, useRef } from 'react';
import {
  useAddMandalMemberMutation,
  useUpdateMandalMemberMutation,
  useGetMandalsQuery,
  useGetCitiesQuery
} from '../../../../services/apiSlice';
import { Loader2, Plus, User, Phone, UsersRound, MapPin, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';

const AddMemberModal = ({ isOpen, onClose, editingMember = null }) => {
  const [addMember, { isLoading: isAdding }] = useAddMandalMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateMandalMemberMutation();
  const { data: mandalsData } = useGetMandalsQuery({ fetchAll: 'true' });
  const { data: citiesData } = useGetCitiesQuery();
  const mandals = mandalsData?.data?.rows || [];
  const cities = citiesData?.data || [];

  const nameRef = useRef(null);
  const mobileRef = useRef(null);
  const mandalRef = useRef(null);
  const cityRef = useRef(null);
  const submitRef = useRef(null);

  const [form, setForm] = useState({ name: '', mobileNumber: '', mandalId: '', mandalName: '', locationId: '', cityName: '' });
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editingMember) {
        setForm({
          name: editingMember.name || '',
          mobileNumber: editingMember.mobileNumber || '',
          mandalId: editingMember.mandalId || '',
          mandalName: editingMember.mandal?.name || '',
          locationId: editingMember.locationId || '',
          cityName: editingMember.location?.name || '',
        });
      } else {
        setForm({ name: '', mobileNumber: '', mandalId: '', mandalName: '', locationId: '', cityName: '' });
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
    const { name, value } = e.target;
    if (name === 'mobileNumber') {
      setForm(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
      return;
    }
    if (name === 'mandalName') {
      setForm(prev => ({ ...prev, mandalName: value, mandalId: '' }));
      setActiveDropdown('mandalName');
      return;
    }
    if (name === 'cityName') {
      setForm(prev => ({ ...prev, cityName: value, locationId: '' }));
      setActiveDropdown('cityName');
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
      const payload = { name: form.name, mobileNumber: form.mobileNumber, mandalId: form.mandalId, locationId: form.locationId || null };
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
          />
          <SearchableDropdown
            label="Location (City)"
            name="cityName"
            placeholder="Select City"
            value={form.cityName}
            items={cities}
            onChange={handleChange}
            onSelect={(id, name) => { setForm(prev => ({ ...prev, locationId: id, cityName: name })); setActiveDropdown(null); }}
            onKeyDown={(e) => handleKeyDown(e, submitRef)}
            isActive={activeDropdown === 'cityName'}
            setActive={setActiveDropdown}
            inputRef={cityRef}
            icon={MapPin}
          />
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
