import React, { useState, useEffect, useRef } from 'react';
import {
  useAddGaushalaMutation,
  useUpdateGaushalaMutation
} from '../../../../services/gaushalaApi';
import {
  useLazyGetAllCitiesQuery,
  useLazyGetAllStatesQuery,
  useLazyGetAllCountriesQuery
} from '../../../../services/masterApi';
import { toast } from 'react-toastify';
import { handleMutationError } from '../../../../utils/errorHelper';
import { MapPin, Tag, Loader2, CheckCircle2, Edit, Building2Icon } from 'lucide-react';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import FormInput from '../../../../components/common/FormInput';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';

const AddGaushalaModal = ({
  isOpen,
  onClose,
  editingGaushala,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    isActive: true
  });

  const [locationData, setLocationData] = useState({
    cityId: '',
    cityName: '',
    stateId: '',
    stateName: '',
    countryId: '',
    countryName: '',
  });

  const [errors, setErrors] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);

  const nameRef = useRef(null);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const submitRef = useRef(null);

  const [triggerGetAllCountries] = useLazyGetAllCountriesQuery();
  const [triggerGetAllStates] = useLazyGetAllStatesQuery();
  const [triggerGetAllCities] = useLazyGetAllCitiesQuery();

  const countryPagination = useDropdownPagination(triggerGetAllCountries);
  const statePagination = useDropdownPagination(triggerGetAllStates, { countryId: locationData.countryId }, !locationData.countryId);
  const cityPagination = useDropdownPagination(triggerGetAllCities, { stateId: locationData.stateId }, !locationData.stateId);

  const [addGaushala, { isLoading: isAdding }] = useAddGaushalaMutation();
  const [updateGaushala, { isLoading: isUpdating }] = useUpdateGaushalaMutation();
  const isLoading = isAdding || isUpdating;

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name' && !value) {
      error = 'Gaushala name is required';
    } else if (name === 'cityName' && !value) {
      error = 'City is required';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  useEffect(() => {
    if (isOpen) {
      if (editingGaushala) {
        setFormData({
          name: editingGaushala.name || '',
          isActive: editingGaushala.isActive ?? true
        });
        setLocationData({
          cityId: editingGaushala.locationId || '',
          cityName: editingGaushala.city || '',
          stateId: editingGaushala.stateId || '',
          stateName: editingGaushala.state || '',
          countryId: editingGaushala.countryId || '',
          countryName: editingGaushala.country || '',
        });
      } else {
        setFormData({ name: '', isActive: true });
        setLocationData({ cityId: '', cityName: '', stateId: '', stateName: '', countryId: '', countryName: '' });
      }

      // Use a small timeout to ensure DOM is ready before focusing
      const timer = setTimeout(() => {
        nameRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [editingGaushala, isOpen]);

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
    validateField('cityName', upperName);
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'name') validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateField('name', formData.name);
    const cityErr = validateField('cityName', locationData.cityName);

    if (nameErr || cityErr) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        country: locationData.countryName,
        state: locationData.stateName,
        city: locationData.cityName,
        locationId: locationData.cityId || undefined,
        isActive: formData.isActive
      };

      if (editingGaushala) {
        await updateGaushala({ id: editingGaushala.id, ...payload }).unwrap();
        toast.success('Gaushala updated successfully!');
      } else {
        await addGaushala(payload).unwrap();
        toast.success('Gaushala added successfully!');
      }
      onClose();
    } catch (err) {
      handleMutationError(err, `Failed to ${editingGaushala ? 'update' : 'add'} gaushala`);
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGaushala ? "Edit Gaushala" : "Add New Gaushala"}
      icon={editingGaushala ? <Edit /> : <Building2Icon />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Gaushala Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            inputRef={nameRef}
            placeholder="Ex: Kobdi Gaushala"
            className="sm:col-span-2"
            icon={Tag}
            error={errors.name}
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
            name="stateName"
            placeholder="Search State..."
            value={locationData.stateName}
            items={statePagination.items}
            onChange={handleStateInputChange}
            onSelect={(id, name) => handleStateSelect(id, name)}
            isActive={activeDropdown === 'stateName'}
            setActive={setActiveDropdown}
            inputRef={stateRef}
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
            inputRef={cityRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={cityPagination.handleLoadMore}
            hasMore={cityPagination.hasMore}
            loading={cityPagination.loading}
            error={errors.cityName}
            allowTransliteration={false}
            disabled={!locationData.stateId && !locationData.stateName}
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Status</label>
            <div className="flex items-center h-[42px]">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  className="sr-only peer"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className={`ms-3 text-sm font-bold ${formData.isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>
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
            ref={submitRef}
            type="submit"
            disabled={isLoading}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Save Gaushala
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddGaushalaModal;
