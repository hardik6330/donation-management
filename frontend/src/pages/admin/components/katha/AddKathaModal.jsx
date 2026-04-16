import React, { useState, useEffect, useRef } from 'react';
import {
  useAddKathaMutation,
  useUpdateKathaMutation
} from '../../../../services/kathaApi';
import {
  useLazyGetAllCitiesQuery,
  useLazyGetAllStatesQuery,
  useLazyGetAllCountriesQuery
} from '../../../../services/masterApi';
import { toast } from 'react-toastify';
import { handleMutationError } from '../../../../utils/errorHelper';
import { MapPin, Mic2Icon, Loader2, CheckCircle2, Calendar, Tag, CheckCircle, Edit } from 'lucide-react';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import FormInput from '../../../../components/common/FormInput';
import CustomDatePicker from '../../../../components/common/CustomDatePicker';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';

const AddKathaModal = ({
  isOpen,
  onClose,
  editingKatha,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    statusName: 'Upcoming',
    description: ''
  });

  const [locationData, setLocationData] = useState({
    cityId: '',
    cityName: '',
    stateId: '',
    stateName: '',
    countryId: '',
    countryName: '',
  });

  const [activeDropdown, setActiveDropdown] = useState(null);

  const nameRef = useRef(null);

  const [triggerGetAllCountries] = useLazyGetAllCountriesQuery();
  const [triggerGetAllStates] = useLazyGetAllStatesQuery();
  const [triggerGetAllCities] = useLazyGetAllCitiesQuery();

  const countryPagination = useDropdownPagination(triggerGetAllCountries);
  const statePagination = useDropdownPagination(triggerGetAllStates, { countryId: locationData.countryId }, !locationData.countryId);
  const cityPagination = useDropdownPagination(triggerGetAllCities, { stateId: locationData.stateId }, !locationData.stateId);

  const [addKatha, { isLoading: isAdding }] = useAddKathaMutation();
  const [updateKatha, { isLoading: isUpdating }] = useUpdateKathaMutation();
  const isLoading = isAdding || isUpdating;

  useEffect(() => {
    if (editingKatha) {
      setFormData({
        name: editingKatha.name || '',
        startDate: editingKatha.startDate ? new Date(editingKatha.startDate).toISOString().split('T')[0] : '',
        endDate: editingKatha.endDate ? new Date(editingKatha.endDate).toISOString().split('T')[0] : '',
        status: editingKatha.status || 'upcoming',
        statusName: editingKatha.status ? editingKatha.status.charAt(0).toUpperCase() + editingKatha.status.slice(1) : 'Upcoming',
        description: editingKatha.description || ''
      });
      setLocationData({
        cityId: editingKatha.locationId || '',
        cityName: editingKatha.city || '',
        stateId: editingKatha.stateId || '',
        stateName: editingKatha.state || '',
        countryId: editingKatha.countryId || '',
        countryName: editingKatha.country || '',
      });
    } else {
      setFormData({
        name: '', startDate: '', endDate: '', status: 'upcoming', statusName: 'Upcoming', description: ''
      });
      setLocationData({ cityId: '', cityName: '', stateId: '', stateName: '', countryId: '', countryName: '' });
    }

    if (isOpen && nameRef.current) {
      nameRef.current.focus();
    }
  }, [editingKatha, isOpen]);

  const handleCountrySelect = (id, name) => {
    const upperName = name.toUpperCase();
    setLocationData(prev => ({
      ...prev,
      countryId: id,
      countryName: upperName,
      stateId: '',
      stateName: '',
      cityId: '',
      cityName: '',
    }));
    setActiveDropdown(null);
  };

  const handleCountryInputChange = (e) => {
    const upperVal = e.target.value.toUpperCase();
    setLocationData(prev => ({
      ...prev,
      countryName: upperVal,
      countryId: '',
      stateId: '',
      stateName: '',
      cityId: '',
      cityName: '',
    }));
    countryPagination.handleSearch(upperVal);
    setActiveDropdown('countryName');
  };

  const handleStateSelect = (id, name) => {
    const upperName = name.toUpperCase();
    setLocationData(prev => ({
      ...prev,
      stateId: id,
      stateName: upperName,
      cityId: '',
      cityName: '',
    }));
    setActiveDropdown(null);
  };

  const handleStateInputChange = (e) => {
    const upperVal = e.target.value.toUpperCase();
    setLocationData(prev => ({
      ...prev,
      stateName: upperVal,
      stateId: '',
      cityId: '',
      cityName: '',
    }));
    statePagination.handleSearch(upperVal);
    setActiveDropdown('stateName');
  };

  const handleCitySelect = (id, name) => {
    const selectedCity = cityPagination.items.find(c => c.id === id);
    const upperName = name.toUpperCase();
    setLocationData(prev => ({
      ...prev,
      cityId: id,
      cityName: upperName,
      stateId: selectedCity?.stateId || prev.stateId,
      stateName: selectedCity?.stateName?.toUpperCase() || prev.stateName,
      countryId: selectedCity?.countryId || prev.countryId,
      countryName: selectedCity?.countryName?.toUpperCase() || prev.countryName,
    }));
    setActiveDropdown(null);
  };

  const handleCityInputChange = (e) => {
    const upperVal = e.target.value.toUpperCase();
    setLocationData(prev => ({
      ...prev,
      cityName: upperVal,
      cityId: '',
    }));
    cityPagination.handleSearch(upperVal);
    setActiveDropdown('cityName');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'statusName') {
      setFormData(prev => ({ ...prev, statusName: value, status: '' }));
      setActiveDropdown('statusName');
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Katha name is required');
    if (!locationData.cityName) return toast.error('Please select a city');

    try {
      const payload = {
        name: formData.name,
        country: locationData.countryName,
        state: locationData.stateName,
        city: locationData.cityName,
        locationId: locationData.cityId || undefined,
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
      handleMutationError(err, `Failed to ${editingKatha ? 'update' : 'add'} katha`);
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
            inputRef={nameRef}
            placeholder="Ex: Bhagvat Katha"
            className="sm:col-span-2"
            icon={Tag}
          />

          <SearchableDropdown
            label="Country"
            name="countryName"
            placeholder="Search Country..."
            value={locationData.countryName}
            items={countryPagination.items}
            onChange={handleCountryInputChange}
            onSelect={(id, name) => handleCountrySelect(id, name)}
            isActive={activeDropdown === 'countryName'}
            setActive={setActiveDropdown}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={countryPagination.handleLoadMore}
            hasMore={countryPagination.hasMore}
            loading={countryPagination.loading}
            allowTransliteration={false}
          />

          <SearchableDropdown
            label="State"
            name="stateName"
            placeholder="Search State..."
            value={locationData.stateName}
            items={statePagination.items}
            onChange={handleStateInputChange}
            onSelect={(id, name) => handleStateSelect(id, name)}
            isActive={activeDropdown === 'stateName'}
            setActive={setActiveDropdown}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={statePagination.handleLoadMore}
            hasMore={statePagination.hasMore}
            loading={statePagination.loading}
            allowTransliteration={false}
            disabled={!locationData.countryId && !locationData.countryName}
          />

          <SearchableDropdown
            label="City"
            name="cityName"
            placeholder="Search City..."
            value={locationData.cityName}
            items={cityPagination.items}
            onChange={handleCityInputChange}
            onSelect={(id, name) => handleCitySelect(id, name)}
            isActive={activeDropdown === 'cityName'}
            setActive={setActiveDropdown}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={cityPagination.handleLoadMore}
            hasMore={cityPagination.hasMore}
            loading={cityPagination.loading}
            allowTransliteration={false}
            disabled={!locationData.stateId && !locationData.stateName}
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
            isActive={activeDropdown === 'statusName'}
            setActive={setActiveDropdown}
            icon={CheckCircle}
            allowTransliteration={false}
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
            placeholder="Katha details..."
            className="sm:col-span-2"
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            tabIndex={-1}
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition"
          >
            Cancel
          </button>
          <button
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
