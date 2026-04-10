import React, { useState, useEffect, useRef } from 'react';
import {
  useAddGaushalaMutation,
  useUpdateGaushalaMutation
} from '../../../../services/apiSlice';
import { toast } from 'react-toastify';
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
    cityId: '',
    cityName: '',
    talukaId: '',
    talukaName: '',
    villageId: '',
    villageName: '',
    isActive: true
  });

  const [activeDropdown, setActiveDropdown] = useState(null);

  // Refs for Fast Entry
  const nameRef = useRef(null);
  const cityRef = useRef(null);
  const talukaRef = useRef(null);
  const villageRef = useRef(null);
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
        cityId: editingGaushala.locationId || '', 
        cityName: editingGaushala.city || '',
        talukaId: '',
        talukaName: editingGaushala.taluka || '',
        villageId: '',
        villageName: editingGaushala.village || '',
        isActive: editingGaushala.isActive ?? true
      });
    } else {
      setFormData({
        name: '', cityId: '', cityName: '', talukaId: '', talukaName: '', villageId: '', villageName: '', isActive: true
      });
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
    const { name, value, type, checked } = e.target;

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
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Gaushala name is required');

    if (!formData.cityName) return toast.error('Please select or enter a city');

    try {
      const payload = {
        name: formData.name,
        city: formData.cityName,
        taluka: formData.talukaName,
        village: formData.villageName,
        locationId: formData.villageId || formData.talukaId || formData.cityId,
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
      toast.error(err?.data?.message || `Failed to ${editingGaushala ? 'update' : 'add'} gaushala`);
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
            onKeyDown={(e) => handleKeyDown(e, submitRef)}
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
