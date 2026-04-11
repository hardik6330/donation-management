import React, { useState, useEffect, useRef } from 'react';
import {
  useAddBapuScheduleMutation,
  useUpdateBapuScheduleMutation
} from '../../../../services/apiSlice';
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
  cityPagination,
  talukaPagination,
  villagePagination,
  setModalState
}) => {
  const [addSchedule, { isLoading: isAdding }] = useAddBapuScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateBapuScheduleMutation();
  const isLoading = isAdding || isUpdating;

  // Initial state logic moved here
  const getInitialState = () => {
    if (editingSchedule) {
      let cityId = '', talukaId = '', villageId = '';
      const loc = editingSchedule.location;

      if (loc) {
        if (loc.type === 'village') {
          villageId = loc.id;
          talukaId = loc.parentId;
          cityId = loc.parent?.parentId || '';
        } else if (loc.type === 'taluka') {
          talukaId = loc.id;
          cityId = loc.parentId;
        } else if (loc.type === 'city') {
          cityId = loc.id;
        }
      }

      return {
        date: editingSchedule.date ? new Date(editingSchedule.date).toISOString().split('T')[0] : '',
        time: editingSchedule.time || '',
        cityId: cityId,
        talukaId: talukaId,
        villageId: villageId,
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
      cityId: '',
      talukaId: '',
      villageId: '',
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
        talukaName: editingSchedule.taluka || '',
        villageName: editingSchedule.village || '',
        eventTypeName: editingSchedule.eventType || 'Padhramani',
      };
    }
    return {
      cityName: '',
      talukaName: '',
      villageName: '',
      eventTypeName: 'Padhramani',
    };
  };

  const [addForm, setAddForm] = useState(getInitialState);
  const [addDropdownLabels, setAddDropdownLabels] = useState(getInitialLabels);
  const [activeAddDropdown, setActiveAddDropdown] = useState(null);
  const [errors, setErrors] = useState({});

  // Refs for Fast Entry
  const contactRef = useRef(null);
  const mobileRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const eventTypeRef = useRef(null);
  const cityRef = useRef(null);
  const talukaRef = useRef(null);
  const villageRef = useRef(null);
  const amountRef = useRef(null);
  const descriptionRef = useRef(null);
  const submitRef = useRef(null);

  const cities = cityPagination.items;
  const talukas = talukaPagination.items;
  const villages = villagePagination.items;

  // Focus effect remains
  useEffect(() => {
    if (isOpen && contactRef.current) {
      contactRef.current.focus();
    }
  }, [isOpen]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'mobileNumber') {
      if (value && value.length !== 10) error = 'Enter exactly 10 digits';
    } else if (name === 'amount') {
      if (value && isNaN(value)) error = 'Invalid amount';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) {
        if (nextRef.current.focus) nextRef.current.focus();
        // If it's a dropdown or date picker that needs to be opened, we can handle it here if needed
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
    if (name === 'cityName') {
      setAddDropdownLabels(prev => ({ ...prev, cityName: value, talukaName: '', villageName: '' }));
      setAddForm(prev => ({ ...prev, cityId: '', talukaId: '', villageId: '' }));
      setModalState(prev => ({ ...prev, cityId: '', talukaId: '' }));
      cityPagination.handleSearch(value);
      setActiveAddDropdown('cityName');
      return;
    }
    if (name === 'talukaName') {
      setAddDropdownLabels(prev => ({ ...prev, talukaName: value, villageName: '' }));
      setAddForm(prev => ({ ...prev, talukaId: '', villageId: '' }));
      setModalState(prev => ({ ...prev, talukaId: '' }));
      talukaPagination.handleSearch(value);
      setActiveAddDropdown('talukaName');
      return;
    }
    if (name === 'villageName') {
      setAddDropdownLabels(prev => ({ ...prev, villageName: value }));
      setAddForm(prev => ({ ...prev, villageId: '' }));
      villagePagination.handleSearch(value);
      setActiveAddDropdown('villageName');
      return;
    }

    if (name === 'mobileNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setAddForm(prev => ({ ...prev, [name]: cleaned }));
      validateField(name, cleaned);
      return;
    }

    setAddForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleAddDropdownSelect = (field, id, name) => {
    if (field === 'eventType') {
      setAddForm(prev => ({ ...prev, eventType: id }));
      setAddDropdownLabels(prev => ({ ...prev, eventTypeName: name }));
    } else if (field === 'cityId') {
      setAddForm(prev => ({ ...prev, cityId: id, talukaId: '', villageId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, cityName: name, talukaName: '', villageName: '' }));
      setModalState(prev => ({ ...prev, cityId: id, talukaId: '' }));
      talukaPagination.reset();
      villagePagination.reset();
    } else if (field === 'talukaId') {
      setAddForm(prev => ({ ...prev, talukaId: id, villageId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, talukaName: name, villageName: '' }));
      setModalState(prev => ({ ...prev, talukaId: id }));
      villagePagination.reset();
    } else if (field === 'villageId') {
      setAddForm(prev => ({ ...prev, villageId: id }));
      setAddDropdownLabels(prev => ({ ...prev, villageName: name }));
    }
    setActiveAddDropdown(null);
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
        city: addDropdownLabels.cityName,
        taluka: addDropdownLabels.talukaName,
        village: addDropdownLabels.villageName,
        locationId: addForm.villageId || addForm.talukaId || addForm.cityId
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
          />

          <SearchableDropdown
            label="City"
            name="cityName"
            placeholder="Select or Type City"
            value={addDropdownLabels.cityName}
            items={cities}
            onChange={handleAddInputChange}
            onSelect={(id, name) => handleAddDropdownSelect('cityId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, talukaRef)}
            isActive={activeAddDropdown === 'cityName'}
            setActive={setActiveAddDropdown}
            required
            inputRef={cityRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={cityPagination.handleLoadMore}
            hasMore={cityPagination.hasMore}
            loading={cityPagination.loading}
          />

          <SearchableDropdown
            label="Taluka"
            name="talukaName"
            placeholder="Select or Type Taluka"
            value={addDropdownLabels.talukaName}
            items={talukas}
            onChange={handleAddInputChange}
            onSelect={(id, name) => handleAddDropdownSelect('talukaId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, villageRef)}
            isActive={activeAddDropdown === 'talukaName'}
            setActive={setActiveAddDropdown}
            disabled={!addDropdownLabels.cityName}
            inputRef={talukaRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={talukaPagination.handleLoadMore}
            hasMore={talukaPagination.hasMore}
            loading={talukaPagination.loading}
          />

          <SearchableDropdown
            label="Village"
            name="villageName"
            placeholder="Select or Type Village"
            value={addDropdownLabels.villageName}
            items={villages}
            onChange={handleAddInputChange}
            onSelect={(id, name) => handleAddDropdownSelect('villageId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, amountRef)}
            isActive={activeAddDropdown === 'villageName'}
            setActive={setActiveAddDropdown}
            disabled={!addDropdownLabels.talukaName}
            inputRef={villageRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={villagePagination.handleLoadMore}
            hasMore={villagePagination.hasMore}
            loading={villagePagination.loading}
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
