import React, { useState, useEffect, useRef } from 'react';
import {
  useAddBapuScheduleMutation,
  useUpdateBapuScheduleMutation,
  useGetCitiesQuery,
  useGetSubLocationsQuery
} from '../../../../services/apiSlice';
import { Calendar, X, ChevronDown, Loader2, Clock, MapPin, User, Phone, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import FormInput from '../../../../components/common/FormInput';
import CustomDatePicker from '../../../../components/common/CustomDatePicker';

const AddBapuScheduleModal = ({ isOpen, onClose, editingSchedule }) => {
  const [addSchedule, { isLoading: isAdding }] = useAddBapuScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateBapuScheduleMutation();
  const isLoading = isAdding || isUpdating;

  const { data: citiesData } = useGetCitiesQuery();

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
      };
    }
    return {
      cityName: '',
      talukaName: '',
      villageName: '',
    };
  };

  const [addForm, setAddForm] = useState(getInitialState);
  const [addDropdownLabels, setAddDropdownLabels] = useState(getInitialLabels);
  const [activeAddDropdown, setActiveAddDropdown] = useState(null);

  // Refs for Fast Entry
  const timeRef = useRef(null);
  const eventTypeRef = useRef(null);
  const cityRef = useRef(null);
  const talukaRef = useRef(null);
  const villageRef = useRef(null);
  const contactRef = useRef(null);
  const mobileRef = useRef(null);
  const descriptionRef = useRef(null);
  const submitRef = useRef(null);

  const { data: talukasData } = useGetSubLocationsQuery(addForm.cityId, { skip: !addForm.cityId });
  const { data: villagesData } = useGetSubLocationsQuery(addForm.talukaId, { skip: !addForm.talukaId });

  const cities = citiesData?.data || [];
  const talukas = talukasData?.data || [];
  const villages = villagesData?.data || [];

  // Focus effect remains
  useEffect(() => {
    if (isOpen && timeRef.current) {
      timeRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cityName') {
      setAddDropdownLabels(prev => ({ ...prev, cityName: value, talukaName: '', villageName: '' }));
      setAddForm(prev => ({ ...prev, cityId: '', talukaId: '', villageId: '' }));
      setActiveAddDropdown('cityName');
      return;
    }
    if (name === 'talukaName') {
      setAddDropdownLabels(prev => ({ ...prev, talukaName: value, villageName: '' }));
      setAddForm(prev => ({ ...prev, talukaId: '', villageId: '' }));
      setActiveAddDropdown('talukaName');
      return;
    }
    if (name === 'villageName') {
      setAddDropdownLabels(prev => ({ ...prev, villageName: value }));
      setAddForm(prev => ({ ...prev, villageId: '' }));
      setActiveAddDropdown('villageName');
      return;
    }

    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDropdownSelect = (field, id, name) => {
    if (field === 'cityId') {
      setAddForm(prev => ({ ...prev, cityId: id, talukaId: '', villageId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, cityName: name, talukaName: '', villageName: '' }));
    } else if (field === 'talukaId') {
      setAddForm(prev => ({ ...prev, talukaId: id, villageId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, talukaName: name, villageName: '' }));
    } else if (field === 'villageId') {
      setAddForm(prev => ({ ...prev, villageId: id }));
      setAddDropdownLabels(prev => ({ ...prev, villageName: name }));
    }
    setActiveAddDropdown(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
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
          <CustomDatePicker
            label="Date"
            name="date"
            required
            value={addForm.date}
            onChange={(e) => setAddForm(prev => ({ ...prev, date: e.target.value }))}
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Event Type</label>
            <select
              ref={eventTypeRef}
              value={addForm.eventType}
              onChange={(e) => setAddForm(prev => ({ ...prev, eventType: e.target.value }))}
              onKeyDown={(e) => handleKeyDown(e, cityRef)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="Padhramani">Padhramani</option>
              <option value="Katha">Katha</option>
              <option value="Event">Event</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

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
          />

          <SearchableDropdown
            label="Village"
            name="villageName"
            placeholder="Select or Type Village"
            value={addDropdownLabels.villageName}
            items={villages}
            onChange={handleAddInputChange}
            onSelect={(id, name) => handleAddDropdownSelect('villageId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, contactRef)}
            isActive={activeAddDropdown === 'villageName'}
            setActive={setActiveAddDropdown}
            disabled={!addDropdownLabels.talukaName}
            inputRef={villageRef}
            icon={MapPin}
          />

          <FormInput
            label="Contact Person"
            value={addForm.contactPerson}
            onChange={(e) => setAddForm(prev => ({ ...prev, contactPerson: e.target.value }))}
            onKeyDown={(e) => handleKeyDown(e, mobileRef)}
            inputRef={contactRef}
            icon={User}
          />

          <FormInput
            label="Mobile Number"
            type="tel"
            value={addForm.mobileNumber}
            onChange={(e) => setAddForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
            onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
            inputRef={mobileRef}
            icon={Phone}
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
