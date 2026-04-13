import { useState, useEffect, useRef } from 'react';
import {
  useAddKartalDhunMutation,
  useUpdateKartalDhunMutation
} from '../../../../services/kartalDhunApi';
import { Loader2, Plus, Tag, Calendar, IndianRupee, MapPin, AlignLeft, Edit, MusicIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import CustomDatePicker from '../../../../components/common/CustomDatePicker';

const AddKartalDhunModal = ({
  isOpen,
  onClose,
  editingRecord = null,
  cityPagination,
  talukaPagination,
  villagePagination,
  setModalState
}) => {
  const [addRecord, { isLoading: isAdding }] = useAddKartalDhunMutation();
  const [updateRecord, { isLoading: isUpdating }] = useUpdateKartalDhunMutation();

  const nameRef = useRef(null);
  const amountRef = useRef(null);
  const cityRef = useRef(null);
  const talukaRef = useRef(null);
  const villageRef = useRef(null);
  const descriptionRef = useRef(null);
  const submitRef = useRef(null);

  const [form, setForm] = useState({
    name: '', date: '', amount: '', description: '',
    cityId: '', cityName: '', talukaId: '', talukaName: '', villageId: '', villageName: ''
  });
  const [activeDropdown, setActiveDropdown] = useState(null);

  const cities = cityPagination.items;
  const talukas = talukaPagination.items;
  const villages = villagePagination.items;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editingRecord) {
        setForm({
          name: editingRecord.name || '',
          date: editingRecord.date || '',
          amount: editingRecord.amount?.toString() || '',
          description: editingRecord.description || '',
          cityId: '', cityName: editingRecord.city || '',
          talukaId: '', talukaName: editingRecord.taluka || '',
          villageId: '', villageName: editingRecord.village || '',
        });
      } else {
        setForm({
          name: '', date: new Date().toISOString().split('T')[0], amount: '', description: '',
          cityId: '', cityName: '', talukaId: '', talukaName: '', villageId: '', villageName: ''
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [editingRecord, isOpen]);

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
    if (name === 'cityName') {
      setForm(prev => ({ ...prev, cityName: value, cityId: '', talukaId: '', talukaName: '', villageId: '', villageName: '' }));
      setModalState(prev => ({ ...prev, cityId: '', talukaId: '' }));
      cityPagination.handleSearch(value);
      setActiveDropdown('cityName');
      return;
    }
    if (name === 'talukaName') {
      setForm(prev => ({ ...prev, talukaName: value, talukaId: '', villageId: '', villageName: '' }));
      setModalState(prev => ({ ...prev, talukaId: '' }));
      talukaPagination.handleSearch(value);
      setActiveDropdown('talukaName');
      return;
    }
    if (name === 'villageName') {
      setForm(prev => ({ ...prev, villageName: value, villageId: '' }));
      villagePagination.handleSearch(value);
      setActiveDropdown('villageName');
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDropdownSelect = (field, id, name) => {
    if (field === 'cityId') {
      setForm(prev => ({ ...prev, cityId: id, cityName: name, talukaId: '', talukaName: '', villageId: '', villageName: '' }));
      setModalState(prev => ({ ...prev, cityId: id, talukaId: '' }));
      talukaPagination.reset();
      villagePagination.reset();
    } else if (field === 'talukaId') {
      setForm(prev => ({ ...prev, talukaId: id, talukaName: name, villageId: '', villageName: '' }));
      setModalState(prev => ({ ...prev, talukaId: id }));
      villagePagination.reset();
    } else if (field === 'villageId') {
      setForm(prev => ({ ...prev, villageId: id, villageName: name }));
    }
    setActiveDropdown(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.date || !form.amount) {
      toast.error('Name, Date and Amount are required');
      return;
    }
    try {
      const payload = {
        name: form.name,
        date: form.date,
        amount: parseFloat(form.amount),
        description: form.description,
        city: form.cityName,
        taluka: form.talukaName,
        village: form.villageName,
        locationId: form.villageId || form.talukaId || form.cityId || null,
      };
      if (editingRecord) {
        await updateRecord({ id: editingRecord.id, ...payload }).unwrap();
        toast.success('Record updated successfully');
      } else {
        await addRecord(payload).unwrap();
        toast.success('Kartal Dhun income added');
      }
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save record');
    }
  };

  const isLoading = isAdding || isUpdating;

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={editingRecord ? "Edit Dhun Mandal" : "Add Dhun Mandal Income"} icon={editingRecord ? <Edit /> : <MusicIcon />} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Dhun Mandal Name" name="name" placeholder="E.g. Navratri Dhun Mandal" value={form.name} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, amountRef)} inputRef={nameRef} icon={Tag} required />
          
        <div className="grid grid-cols-2 gap-4">
          <CustomDatePicker
            label="Date"
            name="date"
            required
            value={form.date}
            onChange={handleChange}
            icon={Calendar}
          />
          <FormInput label="Amount (₹)" name="amount" type="number" placeholder="0" value={form.amount} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, cityRef)} inputRef={amountRef} icon={IndianRupee} required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <SearchableDropdown
            label="City"
            name="cityName"
            placeholder="Select City"
            value={form.cityName}
            items={cities}
            onChange={handleChange}
            onSelect={(id, name) => handleDropdownSelect('cityId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, talukaRef)}
            isActive={activeDropdown === 'cityName'}
            setActive={setActiveDropdown}
            inputRef={cityRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={cityPagination.handleLoadMore}
            hasMore={cityPagination.hasMore}
            loading={cityPagination.loading}
            allowTransliteration={false}
          />
          <SearchableDropdown
            label="Taluka"
            name="talukaName"
            placeholder="Select Taluka"
            value={form.talukaName}
            items={talukas}
            onChange={handleChange}
            onSelect={(id, name) => handleDropdownSelect('talukaId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, villageRef)}
            isActive={activeDropdown === 'talukaName'}
            setActive={setActiveDropdown}
            disabled={!form.cityName}
            inputRef={talukaRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={talukaPagination.handleLoadMore}
            hasMore={talukaPagination.hasMore}
            loading={talukaPagination.loading}
            allowTransliteration={false}
          />
          <SearchableDropdown
            label="Village"
            name="villageName"
            placeholder="Select Village"
            value={form.villageName}
            items={villages}
            onChange={handleChange}
            onSelect={(id, name) => handleDropdownSelect('villageId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
            isActive={activeDropdown === 'villageName'}
            setActive={setActiveDropdown}
            disabled={!form.talukaName}
            inputRef={villageRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={villagePagination.handleLoadMore}
            hasMore={villagePagination.hasMore}
            loading={villagePagination.loading}
            allowTransliteration={false}
          />
        </div>

        <FormInput label="Description" name="description" type="textarea" rows="2" placeholder="Details..." value={form.description} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, submitRef)} inputRef={descriptionRef} icon={AlignLeft} />

        <div className="pt-4 flex items-center gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition">Cancel</button>
          <button ref={submitRef} type="submit" disabled={isLoading} className="flex-[2] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {editingRecord ? "Update Record" : "Add Income"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddKartalDhunModal;
