import React, { useState, useEffect, useRef } from 'react';
import {
  useAddGaushalaMutation,
  useUpdateGaushalaMutation
} from '../../../../services/gaushalaApi';
import { toast } from 'react-toastify';
import { useLocationDropdowns } from '../../../../hooks/useLocationDropdowns';
import { handleMutationError } from '../../../../utils/errorHelper';
import { MapPin, Building2, Plus, Loader2, CheckCircle2, Tag, Edit, Building2Icon } from 'lucide-react';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import FormInput from '../../../../components/common/FormInput';

const AddGaushalaModal = ({
  isOpen,
  onClose,
  editingGaushala,
  cityPagination,
  talukaPagination,
  villagePagination,
  setModalState
}) => {
  const [formData, setFormData] = useState({
    name: '',
    isActive: true
  });

  const {
    cityRef,
    talukaRef,
    villageRef,
    handleLocationInputChange,
    handleLocationSelect,
    locationForm,
    locationLabels,
    setLocationForm,
    setLocationLabels
  } = useLocationDropdowns({
    cityPagination,
    talukaPagination,
    villagePagination,
    setModalState,
    onSelectCallback: (field, id, name) => {
      if (field === 'cityId') validateField('cityName', name);
    }
  });

  const [errors, setErrors] = useState({});

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

  const [activeDropdown, setActiveDropdown] = useState(null);

  // Refs for Fast Entry
  const nameRef = useRef(null);
  const submitRef = useRef(null);

  const cities = cityPagination.items;
  const talukas = talukaPagination.items;
  const villages = villagePagination.items;

  const [addGaushala, { isLoading: isAdding }] = useAddGaushalaMutation();
  const [updateGaushala, { isLoading: isUpdating }] = useUpdateGaushalaMutation();
  const isLoading = isAdding || isUpdating;

  useEffect(() => {
    if (editingGaushala) {
      setFormData({
        name: editingGaushala.name || '',
        isActive: editingGaushala.isActive ?? true
      });
      setLocationForm({
        cityId: editingGaushala.locationId || '',
        talukaId: '',
        villageId: ''
      });
      setLocationLabels({
        cityName: editingGaushala.city || '',
        talukaName: editingGaushala.taluka || '',
        villageName: editingGaushala.village || ''
      });
    } else {
      setFormData({ name: '', isActive: true });
      setLocationForm({ cityId: '', talukaId: '', villageId: '' });
      setLocationLabels({ cityName: '', talukaName: '', villageName: '' });
    }
    
    // Fast Entry: Focus first field
    if (isOpen && nameRef.current) {
      nameRef.current.focus();
    }
  }, [editingGaushala, isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  const handleSelectOption = (field, name, id = '') => {
    if (field === 'city' || field === 'taluka' || field === 'village') {
      const fieldId = field === 'city' ? 'cityId' : field === 'taluka' ? 'talukaId' : 'villageId';
      handleLocationSelect(fieldId, id, name);
    }
    setActiveDropdown(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'cityName' || name === 'talukaName' || name === 'villageName') {
      const dropdown = handleLocationInputChange(name, value);
      if (dropdown) setActiveDropdown(dropdown);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'name') validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nameErr = validateField('name', formData.name);
    const cityErr = validateField('cityName', locationLabels.cityName);

    if (nameErr || cityErr) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        city: locationLabels.cityName,
        taluka: locationLabels.talukaName,
        village: locationLabels.villageName,
        locationId: locationForm.villageId || locationForm.talukaId || locationForm.cityId,
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
            onKeyDown={(e) => handleKeyDown(e, cityRef)}
            inputRef={nameRef}
            placeholder="Ex: Kobdi Gaushala"
            className="sm:col-span-2"
            icon={Tag}
            error={errors.name}
          />

          <SearchableDropdown
            label="City"
            name="cityName"
            placeholder="Search City..."
            value={locationLabels.cityName}
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
            error={errors.cityName}
            allowTransliteration={false}
          />

          <SearchableDropdown
            label="Taluka"
            name="talukaName"
            placeholder="Search Taluka..."
            value={locationLabels.talukaName}
            items={talukas}
            onChange={handleChange}
            onSelect={(id, name) => handleSelectOption('taluka', name, id)}
            onKeyDown={(e) => handleKeyDown(e, villageRef)}
            isActive={activeDropdown === 'talukaName'}
            setActive={setActiveDropdown}
            disabled={!locationLabels.cityName}
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
            placeholder="Search Village..."
            value={locationLabels.villageName}
            items={villages}
            onChange={handleChange}
            onSelect={(id, name) => handleSelectOption('village', name, id)}
            onKeyDown={(e) => handleKeyDown(e, submitRef)}
            isActive={activeDropdown === 'villageName'}
            setActive={setActiveDropdown}
            disabled={!locationLabels.talukaName}
            inputRef={villageRef}
            icon={MapPin}
            isServerSearch={true}
            onLoadMore={villagePagination.handleLoadMore}
            hasMore={villagePagination.hasMore}
            loading={villagePagination.loading}
            allowTransliteration={false}
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
