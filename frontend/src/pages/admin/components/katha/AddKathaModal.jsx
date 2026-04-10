import React, { useState, useEffect, useRef } from 'react';
import {
  useAddKathaMutation,
  useUpdateKathaMutation
} from '../../../../services/apiSlice';
import { toast } from 'react-toastify';
import { MapPin, Mic2, Plus, Loader2, CheckCircle2, Calendar, Tag, CheckCircle, Edit, Mic2Icon } from 'lucide-react';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import FormInput from '../../../../components/common/FormInput';
import CustomDatePicker from '../../../../components/common/CustomDatePicker';

const AddKathaModal = ({
  isOpen,
  onClose,
  editingKatha,
  cityPagination,
  talukaPagination,
  villagePagination,
  setModalState
}) => {
  const [formData, setFormData] = useState({
    name: '',
    cityId: '',
    cityName: '',
    talukaId: '',
    talukaName: '',
    villageId: '',
    villageName: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    statusName: 'Upcoming',
    description: ''
  });

  const [activeDropdown, setActiveDropdown] = useState(null);

  // Refs for Fast Entry
  const nameRef = useRef(null);
  const cityRef = useRef(null);
  const talukaRef = useRef(null);
  const villageRef = useRef(null);
  const statusRef = useRef(null);
  const descriptionRef = useRef(null);
  const submitRef = useRef(null);

  const cities = cityPagination.items;
  const talukas = talukaPagination.items;
  const villages = villagePagination.items;

  const [addKatha, { isLoading: isAdding }] = useAddKathaMutation();
  const [updateKatha, { isLoading: isUpdating }] = useUpdateKathaMutation();
  const isLoading = isAdding || isUpdating;

  useEffect(() => {
    if (editingKatha) {
      setFormData({
        name: editingKatha.name || '',
        cityId: editingKatha.locationId || '',
        cityName: editingKatha.city || '',
        talukaId: '',
        talukaName: editingKatha.taluka || '',
        villageId: '',
        villageName: editingKatha.village || '',
        startDate: editingKatha.startDate ? new Date(editingKatha.startDate).toISOString().split('T')[0] : '',
        endDate: editingKatha.endDate ? new Date(editingKatha.endDate).toISOString().split('T')[0] : '',
        status: editingKatha.status || 'upcoming',
        statusName: editingKatha.status ? editingKatha.status.charAt(0).toUpperCase() + editingKatha.status.slice(1) : 'Upcoming',
        description: editingKatha.description || ''
      });
    } else {
      setFormData({
        name: '', cityId: '', cityName: '', talukaId: '', talukaName: '', villageId: '', villageName: '',
        startDate: '', endDate: '', status: 'upcoming', statusName: 'Upcoming', description: ''
      });
    }

    if (isOpen && nameRef.current) {
      nameRef.current.focus();
    }
  }, [editingKatha, isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  const handleSelectOption = (field, name, id = '') => {
    if (field === 'city') {
      setFormData(prev => ({
        ...prev,
        cityId: id,
        cityName: name,
        talukaId: '',
        talukaName: '',
        villageId: '',
        villageName: ''
      }));
      setModalState(prev => ({ ...prev, cityId: id, talukaId: '' }));
      talukaPagination.reset();
      villagePagination.reset();
    } else if (field === 'taluka') {
      setFormData(prev => ({
        ...prev,
        talukaId: id,
        talukaName: name,
        villageId: '',
        villageName: ''
      }));
      setModalState(prev => ({ ...prev, talukaId: id }));
      villagePagination.reset();
    } else if (field === 'village') {
      setFormData(prev => ({
        ...prev,
        villageId: id,
        villageName: name
      }));
    }
    setActiveDropdown(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'statusName') {
      setFormData(prev => ({ ...prev, statusName: value, status: '' }));
      setActiveDropdown('statusName');
      return;
    }
    if (name === 'cityName') {
      setFormData(prev => ({ ...prev, cityName: value, cityId: '', talukaId: '', villageId: '' }));
      setModalState(prev => ({ ...prev, cityId: '', talukaId: '' }));
      setActiveDropdown('cityName');
    } else if (name === 'talukaName') {
      setFormData(prev => ({ ...prev, talukaName: value, talukaId: '', villageId: '' }));
      setModalState(prev => ({ ...prev, talukaId: '' }));
      setActiveDropdown('talukaName');
    } else if (name === 'villageName') {
      setFormData(prev => ({ ...prev, villageName: value, villageId: '' }));
      setActiveDropdown('villageName');
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Katha name is required');

    if (!formData.cityName) return toast.error('Please select or enter a city');

    try {
      const payload = {
        name: formData.name,
        city: formData.cityName,
        taluka: formData.talukaName,
        village: formData.villageName,
        locationId: formData.villageId || formData.talukaId || formData.cityId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        description: formData.description
      };

      if (editingKatha) {
        await updateKatha({ id: editingKatha.id, ...payload }).unwrap();
        toast.success('Katha updated successfully!');
      } else {
        await addKatha(payload).unwrap();
        toast.success('Katha added successfully!');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || `Failed to ${editingKatha ? 'update' : 'add'} katha`);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingKatha ? "Edit Katha" : "Add New Katha"}
      icon={editingKatha ? <Edit /> : <Mic2Icon />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Katha Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, cityRef)}
            inputRef={nameRef}
            placeholder="Ex: Bhagvat Katha"
            className="sm:col-span-2"
            icon={Tag}
          />

          <SearchableDropdown
            label="City"
            name="cityName"
            placeholder="Search City..."
            value={formData.cityName}
            items={cities}
            onChange={handleChange}
            onSelect={(id, name) => handleSelectOption('city', name, id)}
            onKeyDown={(e) => handleKeyDown(e, talukaRef)}
            isActive={activeDropdown === 'cityName'}
            setActive={setActiveDropdown}
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
            placeholder="Search Taluka..."
            value={formData.talukaName}
            items={talukas}
            onChange={handleChange}
            onSelect={(id, name) => handleSelectOption('taluka', name, id)}
            onKeyDown={(e) => handleKeyDown(e, villageRef)}
            isActive={activeDropdown === 'talukaName'}
            setActive={setActiveDropdown}
            disabled={!formData.cityName}
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
            placeholder="Search Village..."
            value={formData.villageName}
            items={villages}
            onChange={handleChange}
            onSelect={(id, name) => handleSelectOption('village', name, id)}
            onKeyDown={(e) => handleKeyDown(e, statusRef)}
            isActive={activeDropdown === 'villageName'}
            setActive={setActiveDropdown}
            disabled={!formData.talukaName}
            inputRef={villageRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={villagePagination.handleLoadMore}
            hasMore={villagePagination.hasMore}
            loading={villagePagination.loading}
          />

          <SearchableDropdown
            label="Status"
            name="statusName"
            placeholder="Select Status"
            value={formData.statusName}
            items={[
              { id: 'upcoming', name: 'Upcoming' },
              { id: 'active', name: 'Active' },
              { id: 'completed', name: 'Completed' }
            ]}
            onChange={handleChange}
            onSelect={(id, name) => {
              setFormData(prev => ({ ...prev, status: id, statusName: name }));
              setActiveDropdown(null);
            }}
            onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
            isActive={activeDropdown === 'statusName'}
            setActive={setActiveDropdown}
            inputRef={statusRef}
            icon={CheckCircle}
          />

          <CustomDatePicker
            label="Start Date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            icon={Calendar}
          />

          <CustomDatePicker
            label="End Date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            icon={Calendar}
          />

          <FormInput
            label="Description"
            type="textarea"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, submitRef)}
            inputRef={descriptionRef}
            placeholder="Katha details..."
            className="sm:col-span-2"
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            ref={submitRef}
            type="submit"
            disabled={isLoading}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Save Katha
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddKathaModal;
