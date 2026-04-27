import React, { useState, useEffect, useRef } from 'react';
import {
  useAddBapuScheduleMutation,
  useUpdateBapuScheduleMutation
} from '../../../../services/bapuApi';
import { 
  useLazyGetAllCitiesQuery, 
  useLazyGetAllStatesQuery, 
  useLazyGetAllCountriesQuery 
} from '../../../../services/masterApi';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { Calendar, X, ChevronDown, Loader2, Clock, MapPin, User, Phone, Edit, Tag, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import FormInput from '../../../../components/common/FormInput';
import CustomDatePicker from '../../../../components/common/CustomDatePicker';

const eventTypeOptions = [
  { id: 'Padhramani', name: 'Padhramani' },
  { id: 'Katha', name: 'Katha' },
  { id: 'Event', name: 'Event' },
  { id: 'Personal', name: 'Personal' }
];

const AddBapuScheduleModal = ({ 
  isOpen, 
  onClose, 
  editingSchedule,
}) => {
  const [addSchedule, { isLoading: isAdding }] = useAddBapuScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateBapuScheduleMutation();
  const isLoading = isAdding || isUpdating;

  const [triggerGetCountries] = useLazyGetAllCountriesQuery();
  const countryPagination = useDropdownPagination(triggerGetCountries);
  const [triggerGetStates] = useLazyGetAllStatesQuery();
  const statePagination = useDropdownPagination(triggerGetStates);
  const [triggerGetCities] = useLazyGetAllCitiesQuery();
  const cityPagination = useDropdownPagination(triggerGetCities);

  const [activeAddDropdown, setActiveAddDropdown] = useState(null);

  // Initial state logic moved here
  const getInitialState = () => {
    if (editingSchedule) {
      return {
        date: editingSchedule.date ? new Date(editingSchedule.date).toISOString().split('T')[0] : '',
        time: editingSchedule.time || '',
        city: editingSchedule.city || '',
        state: editingSchedule.state || '',
        country: editingSchedule.country || 'INDIA',
        cityId: editingSchedule.cityId || '',
        stateId: editingSchedule.stateId || '',
        countryId: editingSchedule.countryId || '',
        eventType: editingSchedule.eventType || 'Padhramani',
        contactPerson: editingSchedule.contactPerson || '',
        mobileNumber: editingSchedule.mobileNumber || '',
        amount: editingSchedule.amount || '',
        description: editingSchedule.description || '',
        status: editingSchedule.status || 'scheduled'
      };
    }
    return {
      date: '',
      time: '',
      city: '',
      state: '',
      country: 'INDIA',
      cityId: '',
      stateId: '',
      countryId: '',
      eventType: 'Padhramani',
      contactPerson: '',
      mobileNumber: '',
      amount: '',
      description: '',
      status: 'scheduled'
    };
  };

  const getInitialLabels = () => {
    if (editingSchedule) {
      return {
        cityName: editingSchedule.city || '',
        stateName: editingSchedule.state || '',
        countryName: editingSchedule.country || 'INDIA',
        eventTypeName: editingSchedule.eventType || 'Padhramani',
      };
    }
    return {
      cityName: '',
      stateName: '',
      countryName: 'INDIA',
      eventTypeName: 'Padhramani',
    };
  };

  const [addForm, setAddForm] = useState(getInitialState);
  const [addDropdownLabels, setAddDropdownLabels] = useState(getInitialLabels);
  const [errors, setErrors] = useState({});

  // Refs for Fast Entry
  const contactRef = useRef(null);
  const mobileRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const eventTypeRef = useRef(null);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const amountRef = useRef(null);
  const descriptionRef = useRef(null);
  const submitRef = useRef(null);

  const countries = countryPagination.items;
  const states = statePagination.items;
  const cities = cityPagination.items;

  useEffect(() => {
    if (isOpen) {
      setAddForm(getInitialState());
      setAddDropdownLabels(getInitialLabels());
      setTimeout(() => contactRef.current?.focus(), 100);
    }
  }, [editingSchedule, isOpen]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'amount') {
      if (value && isNaN(value)) error = 'Invalid amount';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef === submitRef) {
        handleAddSubmit(e);
      } else if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'eventTypeName') {
      setAddDropdownLabels(prev => ({ ...prev, eventTypeName: value }));
      setAddForm(prev => ({ ...prev, eventType: '' }));
      setActiveAddDropdown('eventTypeName');
      return;
    }
    if (name === 'countryName') {
      const upperVal = value.toUpperCase();
      setAddDropdownLabels(prev => ({ ...prev, countryName: upperVal, stateName: '', cityName: '' }));
      setAddForm(prev => ({ ...prev, country: upperVal, countryId: '', state: '', stateId: '', city: '', cityId: '' }));
      countryPagination.handleSearch(upperVal);
      setActiveAddDropdown('countryName');
      return;
    }
    if (name === 'stateName') {
      const upperVal = value.toUpperCase();
      setAddDropdownLabels(prev => ({ ...prev, stateName: upperVal, cityName: '' }));
      setAddForm(prev => ({ ...prev, state: upperVal, stateId: '', city: '', cityId: '' }));
      statePagination.handleSearch(upperVal);
      setActiveAddDropdown('stateName');
      return;
    }
    if (name === 'cityName') {
      const upperVal = value.toUpperCase();
      setAddDropdownLabels(prev => ({ ...prev, cityName: upperVal }));
      setAddForm(prev => ({ ...prev, city: upperVal, cityId: '' }));
      cityPagination.handleSearch(upperVal);
      setActiveAddDropdown('cityName');
      return;
    }

    if (name === 'mobileNumber') {
      const cleaned = value.replace(/\D/g, '');
      setAddForm(prev => ({ ...prev, [name]: cleaned }));
      validateField(name, cleaned);
      return;
    }

    setAddForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleAddDropdownSelect = (field, id, name) => {
    let nextRef = null;
    const upperName = name.toUpperCase();
    if (field === 'eventType') {
      setAddForm(prev => ({ ...prev, eventType: id }));
      setAddDropdownLabels(prev => ({ ...prev, eventTypeName: name }));
      nextRef = countryRef;
    } else if (field === 'countryId') {
      setAddForm(prev => ({ ...prev, countryId: id, country: upperName, state: '', stateId: '', city: '', cityId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, countryName: upperName, stateName: '', cityName: '' }));
      nextRef = stateRef;
    } else if (field === 'stateId') {
      const selected = states.find(s => s.id === id);
      setAddForm(prev => ({ 
        ...prev, 
        stateId: id, 
        state: upperName, 
        countryId: selected?.countryId || prev.countryId,
        country: selected?.countryName?.toUpperCase() || prev.country,
        city: '', 
        cityId: '' 
      }));
      setAddDropdownLabels(prev => ({ 
        ...prev, 
        stateName: upperName, 
        countryName: selected?.countryName?.toUpperCase() || prev.countryName,
        cityName: '' 
      }));
      nextRef = cityRef;
    } else if (field === 'cityId') {
      const selected = cities.find(c => c.id === id);
      setAddForm(prev => ({ 
        ...prev, 
        cityId: id, 
        city: upperName,
        stateId: selected?.stateId || prev.stateId,
        state: selected?.stateName?.toUpperCase() || prev.state,
        countryId: selected?.countryId || prev.countryId,
        country: selected?.countryName?.toUpperCase() || prev.country
      }));
      setAddDropdownLabels(prev => ({ 
        ...prev, 
        cityName: upperName,
        stateName: selected?.stateName?.toUpperCase() || prev.stateName,
        countryName: selected?.countryName?.toUpperCase() || prev.countryName
      }));
      nextRef = amountRef;
    }
    setActiveAddDropdown(null);
    if (nextRef?.current) {
      setTimeout(() => nextRef.current.focus(), 100);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Validate eventType
    const isValidEventType = eventTypeOptions.some(opt => opt.id === addForm.eventType);
    if (!isValidEventType) {
      toast.error('Please select an Event Type from the dropdown');
      return;
    }

    // Check for validation errors
    const mobileError = validateField('mobileNumber', addForm.mobileNumber);
    if (mobileError) {
      toast.error(mobileError);
      return;
    }

    try {
      const payload = {
        ...addForm,
        country: addDropdownLabels.countryName,
        state: addDropdownLabels.stateName,
        city: addDropdownLabels.cityName,
        locationId: addForm.cityId || addForm.stateId || addForm.countryId
      };

      if (editingSchedule) {
        await updateSchedule({ id: editingSchedule.id, ...payload }).unwrap();
        toast.success('Schedule updated successfully');
      } else {
        await addSchedule(payload).unwrap();
        toast.success('Schedule added successfully');
      }
      
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || `Failed to ${editingSchedule ? 'update' : 'add'} schedule`);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSchedule ? "Edit Bapu Schedule" : "Add Bapu Schedule"}
      icon={editingSchedule ? <Edit /> : <Calendar />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleAddSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Contact Person"
            value={addForm.contactPerson}
            onChange={(e) => setAddForm(prev => ({ ...prev, contactPerson: e.target.value }))}
            onKeyDown={(e) => handleKeyDown(e, mobileRef)}
            inputRef={contactRef}
            icon={User}
            error={errors.contactPerson}
          />

          <FormInput
            label="Mobile Number"
            name="mobileNumber"
            type="tel"
            placeholder="10-digit mobile number"
            value={addForm.mobileNumber}
            onChange={handleAddInputChange}
            onKeyDown={(e) => handleKeyDown(e, dateRef)}
            inputRef={mobileRef}
            icon={Phone}
            error={errors.mobileNumber}
          />

          <CustomDatePicker
            label="Date"
            name="date"
            required
            value={addForm.date}
            onChange={(e) => setAddForm(prev => ({ ...prev, date: e.target.value }))}
            onKeyDown={(e) => handleKeyDown(e, timeRef)}
            inputRef={dateRef}
            icon={Calendar}
          />

          <FormInput
            label="Time"
            type="time"
            value={addForm.time}
            onChange={(e) => setAddForm(prev => ({ ...prev, time: e.target.value }))}
            onKeyDown={(e) => handleKeyDown(e, eventTypeRef)}
            inputRef={timeRef}
            icon={Clock}
          />

          <SearchableDropdown
            label="Event Type"
            name="eventTypeName"
            placeholder="Select Event Type"
            value={addDropdownLabels.eventTypeName}
            items={eventTypeOptions}
            onChange={handleAddInputChange}
            onSelect={(id, name) => handleAddDropdownSelect('eventType', id, name)}
            onKeyDown={(e) => handleKeyDown(e, cityRef)}
            isActive={activeAddDropdown === 'eventTypeName'}
            setActive={setActiveAddDropdown}
            required
            inputRef={eventTypeRef}
            icon={Tag}
            allowTransliteration={false}
          />

          <SearchableDropdown
            label="Country"
            name="countryName"
            placeholder="Select or Type Country"
            value={addDropdownLabels.countryName}
            items={countries}
            onChange={handleAddInputChange}
            onSelect={(id, name) => handleAddDropdownSelect('countryId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, stateRef)}
            isActive={activeAddDropdown === 'countryName'}
            setActive={setActiveAddDropdown}
            required
            inputRef={countryRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={countryPagination.handleSearch}
            hasMore={countryPagination.hasMore}
            loading={countryPagination.loading}
            allowTransliteration={false}
          />

          <SearchableDropdown
            label="State"
            name="stateName"
            placeholder="Select or Type State"
            value={addDropdownLabels.stateName}
            items={states}
            onChange={handleAddInputChange}
            onSelect={(id, name) => handleAddDropdownSelect('stateId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, cityRef)}
            isActive={activeAddDropdown === 'stateName'}
            setActive={setActiveAddDropdown}
            required
            inputRef={stateRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={statePagination.handleSearch}
            hasMore={statePagination.hasMore}
            loading={statePagination.loading}
            allowTransliteration={false}
          />

          <SearchableDropdown
            label="City"
            name="cityName"
            placeholder="Select or Type City"
            value={addDropdownLabels.cityName}
            items={cities}
            onChange={handleAddInputChange}
            onSelect={(id, name) => handleAddDropdownSelect('cityId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, amountRef)}
            isActive={activeAddDropdown === 'cityName'}
            setActive={setActiveAddDropdown}
            required
            inputRef={cityRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={cityPagination.handleSearch}
            hasMore={cityPagination.hasMore}
            loading={cityPagination.loading}
            allowTransliteration={false}
          />

          <FormInput
            label="Amount"
            type="number"
            value={addForm.amount}
            onChange={(e) => setAddForm(prev => ({ ...prev, amount: e.target.value }))}
            onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
            inputRef={amountRef}
            icon={IndianRupee}
            placeholder="Enter amount (optional)"
            error={errors.amount}
          />
        </div>

        <FormInput
          label="Description / Location Details"
          type="textarea"
          rows="3"
          value={addForm.description}
          onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
          onKeyDown={(e) => handleKeyDown(e, submitRef)}
          inputRef={descriptionRef}
        />
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl transition hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            ref={submitRef}
            type="submit"
            disabled={isLoading}
            className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl transition hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingSchedule ? 'Update Schedule' : 'Add Schedule'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddBapuScheduleModal;
