import React, { useState, useEffect, useRef } from 'react';
import {
  useAddKartalDhunMutation,
  useUpdateKartalDhunMutation
} from '../../../../services/kartalDhunApi';
import { 
  useLazyGetAllCitiesQuery, 
  useLazyGetAllStatesQuery, 
  useLazyGetAllCountriesQuery 
} from '../../../../services/masterApi';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
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
}) => {
  const [addRecord, { isLoading: isAdding }] = useAddKartalDhunMutation();
  const [updateRecord, { isLoading: isUpdating }] = useUpdateKartalDhunMutation();

  const [triggerGetCountries] = useLazyGetAllCountriesQuery();
  const countryPagination = useDropdownPagination(triggerGetCountries);
  const [triggerGetStates] = useLazyGetAllStatesQuery();
  const statePagination = useDropdownPagination(triggerGetStates);
  const [triggerGetCities] = useLazyGetAllCitiesQuery();
  const cityPagination = useDropdownPagination(triggerGetCities);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const nameRef = useRef(null);
  const amountRef = useRef(null);
  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const countryRef = useRef(null);
  const descriptionRef = useRef(null);
  const submitRef = useRef(null);

  const [form, setForm] = useState({
    name: '', date: '', amount: '', description: '',
    city: '', state: '', country: 'INDIA',
    cityId: '', stateId: '', countryId: ''
  });

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (editingRecord) {
          setForm({
            name: editingRecord.name || '',
            date: editingRecord.date || '',
            amount: editingRecord.amount?.toString() || '',
            description: editingRecord.description || '',
            city: editingRecord.city || '',
            state: editingRecord.state || '',
            country: editingRecord.country || 'INDIA',
            cityId: editingRecord.cityId || '',
            stateId: editingRecord.stateId || '',
            countryId: editingRecord.countryId || ''
          });
        } else {
          setForm({
            name: '', date: new Date().toISOString().split('T')[0], amount: '', description: '',
            city: '', state: '', country: 'INDIA',
            cityId: '', stateId: '', countryId: ''
          });
        }
        nameRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [editingRecord, isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'country') {
      const upperVal = value.toUpperCase();
      setForm(prev => ({ ...prev, country: upperVal, countryId: '', state: '', stateId: '', city: '', cityId: '' }));
      countryPagination.handleSearch(upperVal);
      setActiveDropdown('country');
      return;
    }
    if (name === 'state') {
      const upperVal = value.toUpperCase();
      setForm(prev => ({ ...prev, state: upperVal, stateId: '', city: '', cityId: '' }));
      statePagination.handleSearch(upperVal);
      setActiveDropdown('state');
      return;
    }
    if (name === 'city') {
      const upperVal = value.toUpperCase();
      setForm(prev => ({ ...prev, city: upperVal, cityId: '' }));
      cityPagination.handleSearch(upperVal);
      setActiveDropdown('city');
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDropdownSelect = (field, id, name) => {
    const upperName = name.toUpperCase();
    if (field === 'country') {
      setForm(prev => ({ ...prev, country: upperName, countryId: id, state: '', stateId: '', city: '', cityId: '' }));
    } else if (field === 'state') {
      const selected = statePagination.items.find(s => s.id === id);
      setForm(prev => ({ 
        ...prev, 
        state: upperName, 
        stateId: id, 
        country: selected?.countryName?.toUpperCase() || prev.country,
        countryId: selected?.countryId || prev.countryId,
        city: '', 
        cityId: '' 
      }));
    } else if (field === 'city') {
      const selected = cityPagination.items.find(c => c.id === id);
      setForm(prev => ({ 
        ...prev, 
        city: upperName, 
        cityId: id,
        state: selected?.stateName?.toUpperCase() || prev.state,
        stateId: selected?.stateId || prev.stateId,
        country: selected?.countryName?.toUpperCase() || prev.country,
        countryId: selected?.countryId || prev.countryId
      }));
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
        amount: parseFloat(form.amount.toString().replace(/,/g, '')),
        description: form.description,
        city: form.city,
        state: form.state,
        country: form.country,
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
            label="Country"
            name="country"
            placeholder="Enter Country"
            value={form.country}
            items={countryPagination.items}
            onChange={handleChange}
            onSelect={(id, name) => handleDropdownSelect('country', id, name)}
            onKeyDown={(e) => handleKeyDown(e, stateRef)}
            isActive={activeDropdown === 'country'}
            setActive={setActiveDropdown}
            inputRef={countryRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={countryPagination.handleLoadMore}
            hasMore={countryPagination.hasMore}
            loading={countryPagination.loading}
            allowTransliteration={false}
          />
          <SearchableDropdown
            label="State"
            name="state"
            placeholder="Enter State"
            value={form.state}
            items={statePagination.items}
            onChange={handleChange}
            onSelect={(id, name) => handleDropdownSelect('state', id, name)}
            onKeyDown={(e) => handleKeyDown(e, cityRef)}
            isActive={activeDropdown === 'state'}
            setActive={setActiveDropdown}
            inputRef={stateRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={statePagination.handleLoadMore}
            hasMore={statePagination.hasMore}
            loading={statePagination.loading}
            allowTransliteration={false}
          />
          <SearchableDropdown
            label="City"
            name="city"
            placeholder="Enter City"
            value={form.city}
            items={cityPagination.items}
            onChange={handleChange}
            onSelect={(id, name) => handleDropdownSelect('city', id, name)}
            onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
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
