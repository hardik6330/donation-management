import React, { useState, useEffect, useRef } from 'react';
import {
  useAddKathaMutation,
  useGetCitiesQuery,
  useGetSubLocationsQuery
} from '../../../../services/apiSlice';
import { toast } from 'react-toastify';
import { MapPin, Mic2, Plus, Loader2, CheckCircle2, Calendar, Tag, CheckCircle } from 'lucide-react';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import FormInput from '../../../../components/common/FormInput';

const AddKathaModal = ({ isOpen, onClose }) => {
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
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const descriptionRef = useRef(null);
  const submitRef = useRef(null);

  const { data: citiesData } = useGetCitiesQuery();
  const { data: talukasData } = useGetSubLocationsQuery(formData.cityId, { skip: !formData.cityId });
  const { data: villagesData } = useGetSubLocationsQuery(formData.talukaId, { skip: !formData.talukaId });

  const cities = citiesData?.data || [];
  const talukas = talukasData?.data || [];
  const villages = villagesData?.data || [];

  const [addKatha, { isLoading }] = useAddKathaMutation();

  // Fast Entry: Focus first field
  useEffect(() => {
    if (isOpen && nameRef.current) {
      nameRef.current.focus();
    }
  }, [isOpen]);

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
    } else if (field === 'taluka') {
      setFormData(prev => ({
        ...prev,
        talukaId: id,
        talukaName: name,
        villageId: '',
        villageName: ''
      }));
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
      setActiveDropdown('city');
    } else if (name === 'talukaName') {
      setFormData(prev => ({ ...prev, talukaName: value, talukaId: '', villageId: '' }));
      setActiveDropdown('taluka');
    } else if (name === 'villageName') {
      setFormData(prev => ({ ...prev, villageName: value, villageId: '' }));
      setActiveDropdown('village');
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
      await addKatha({
        name: formData.name,
        city: formData.cityName,
        taluka: formData.talukaName,
        village: formData.villageName,
        locationId: formData.villageId || formData.talukaId || formData.cityId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        description: formData.description
      }).unwrap();
      toast.success('Katha added successfully!');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add katha');
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Katha"
      icon={<Mic2 />}
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
            isActive={activeDropdown === 'city'}
            setActive={setActiveDropdown}
            inputRef={cityRef}
            icon={MapPin}
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
            isActive={activeDropdown === 'taluka'}
            setActive={setActiveDropdown}
            disabled={!formData.cityName}
            inputRef={talukaRef}
            icon={MapPin}
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
            isActive={activeDropdown === 'village'}
            setActive={setActiveDropdown}
            disabled={!formData.talukaName}
            inputRef={villageRef}
            icon={MapPin}
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
            onKeyDown={(e) => handleKeyDown(e, startDateRef)}
            isActive={activeDropdown === 'statusName'}
            setActive={setActiveDropdown}
            inputRef={statusRef}
            icon={CheckCircle}
          />

          <FormInput
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, endDateRef)}
            inputRef={startDateRef}
            icon={Calendar}
          />

          <FormInput
            label="End Date"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
            inputRef={endDateRef}
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
