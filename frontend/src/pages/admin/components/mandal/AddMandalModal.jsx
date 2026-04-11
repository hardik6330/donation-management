import { useState, useEffect, useRef } from 'react';
import {
  useAddMandalMutation,
  useUpdateMandalMutation
} from '../../../../services/mandalApi';
import { Loader2, Plus, Tag, IndianRupee, Layers, UsersRound, Edit, UsersRoundIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';

const AddMandalModal = ({ isOpen, onClose, editingMandal = null }) => {
  const [addMandal, { isLoading: isAdding }] = useAddMandalMutation();
  const [updateMandal, { isLoading: isUpdating }] = useUpdateMandalMutation();

  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const typeRef = useRef(null);
  const submitRef = useRef(null);

  const [form, setForm] = useState({ name: '', price: '100', mandalType: '', mandalTypeName: '' });
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editingMandal) {
        setForm({
          name: editingMandal.name || '',
          price: editingMandal.price?.toString() || '100',
          mandalType: editingMandal.mandalType || '',
          mandalTypeName: editingMandal.mandalType || '',
        });
      } else {
        setForm({ name: '', price: '100', mandalType: '', mandalTypeName: '' });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [editingMandal, isOpen]);

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
    if (name === 'mandalTypeName') {
      setForm(prev => ({ ...prev, mandalTypeName: value, mandalType: '' }));
      setActiveDropdown('mandalTypeName');
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Name is required');
      return;
    }
    try {
      const payload = {
        name: form.name,
        price: parseInt(form.price) || 100,
        mandalType: form.mandalType
      };
      if (editingMandal) {
        await updateMandal({ id: editingMandal.id, ...payload }).unwrap();
        toast.success('Mandal updated successfully');
      } else {
        await addMandal(payload).unwrap();
        toast.success('Mandal created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save mandal');
    }
  };

  const isLoading = isAdding || isUpdating;

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={editingMandal ? "Edit Mandal" : "Create Mandal"} icon={editingMandal ? <Edit /> : <UsersRoundIcon />}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Mandal Name"
          name="name"
          placeholder="E.g. Navsari Mandal"
          value={form.name}
          onChange={handleChange}
          onKeyDown={(e) => handleKeyDown(e, priceRef)}
          inputRef={nameRef}
          icon={Tag}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Monthly Price (₹)"
            name="price"
            type="number"
            placeholder="100"
            value={form.price}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, typeRef)}
            inputRef={priceRef}
            icon={IndianRupee}
            required
          />
          <SearchableDropdown
            label="Mandal Type"
            name="mandalTypeName"
            placeholder="Select Type"
            value={form.mandalTypeName}
            items={[
              { id: 'Monthly', name: 'Monthly' },
              { id: 'Yearly', name: 'Yearly' }
            ]}
            onChange={handleChange}
            onSelect={(id, name) => {
              setForm(prev => ({ ...prev, mandalType: id, mandalTypeName: name }));
              setActiveDropdown(null);
            }}
            onKeyDown={(e) => handleKeyDown(e, submitRef)}
            isActive={activeDropdown === 'mandalTypeName'}
            setActive={setActiveDropdown}
            inputRef={typeRef}
            icon={Layers}
          />
        </div>
        <div className="pt-4 flex items-center gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">Cancel</button>
          <button ref={submitRef} type="submit" disabled={isLoading} className="flex-[2] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {editingMandal ? "Update Mandal" : "Create Mandal"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddMandalModal;
