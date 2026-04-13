import { useState, useEffect, useRef } from 'react';
import {
  useAddCombinedMasterDataMutation,
  useUpdateLocationMutation
} from '../../../../services/masterApi';
import { toast } from 'react-toastify';
import { MapPin, Plus, Loader2, CheckCircle2, Edit } from 'lucide-react';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';

const AddLocationModal = ({ 
  isOpen, 
  onClose, 
  editingData,
  cityPagination,
  talukaPagination,
  villagePagination,
  setModalState
}) => {
  const [addCombinedMaster, { isLoading: isAdding }] = useAddCombinedMasterDataMutation();
  const [updateLocation, { isLoading: isUpdatingLocation }] = useUpdateLocationMutation();
  const isLoading = isAdding || isUpdatingLocation;

  const getInitialState = () => {
    if (editingData) {
      return {
        city: editingData.name || '',
        cityId: editingData.id || '',
        taluka: '',
        talukaId: '',
        village: '',
      };
    }
    return {
      city: '',
      cityId: '',
      taluka: '',
      talukaId: '',
      village: '',
    };
  };

  const [formData, setFormData] = useState(getInitialState);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Refs for Fast Entry
  const cityRef = useRef(null);
  const talukaRef = useRef(null);
  const villageRef = useRef(null);
  const submitRef = useRef(null);

  const cities = cityPagination.items;
  const talukas = talukaPagination.items;
  const villages = villagePagination.items;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Fast Entry: Focus first field
  useEffect(() => {
    if (isOpen && cityRef.current) {
      cityRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
      return;
    }
  };

  const handleSelectOption = (name, id, value) => {
    if (name === 'city') {
      setFormData(prev => ({
        ...prev,
        city: value,
        cityId: id,
        taluka: '',
        talukaId: '',
        village: ''
      }));
      setModalState(prev => ({ ...prev, cityId: id, talukaId: '' }));
      talukaPagination.reset();
      villagePagination.reset();
    } else if (name === 'taluka') {
      setFormData(prev => ({
        ...prev,
        taluka: value,
        talukaId: id,
        village: ''
      }));
      setModalState(prev => ({ ...prev, talukaId: id }));
      villagePagination.reset();
    } else if (name === 'village') {
      setFormData(prev => ({ ...prev, village: value }));
    }
    setActiveDropdown(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'city') {
      setFormData(prev => ({
        ...prev,
        city: value,
        cityId: '',
        taluka: '',
        talukaId: '',
        village: ''
      }));
      setModalState(prev => ({ ...prev, cityId: '', talukaId: '' }));
      cityPagination.handleSearch(value);
      return;
    }

    if (name === 'taluka') {
      setFormData(prev => ({
        ...prev,
        taluka: value,
        talukaId: '',
        village: ''
      }));
      setModalState(prev => ({ ...prev, talukaId: '' }));
      talukaPagination.handleSearch(value);
      return;
    }

    if (name === 'village') {
      setFormData(prev => ({ ...prev, village: value }));
      villagePagination.handleSearch(value);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingData) {
        await updateLocation({
          id: editingData.id,
          name: formData.city,
        }).unwrap();
        toast.success('Location updated successfully!');
      } else {
        await addCombinedMaster({
          city: formData.city,
          taluka: formData.taluka,
          village: formData.village,
        }).unwrap();
        toast.success('Location saved successfully!');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save location');
    }
  };

  if (!isOpen) return null;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingData ? "Edit Location" : "Add Location"}
      icon={editingData ? <Edit /> : <MapPin />}
      maxWidth="max-w-2xl"
      showLanguageToggle={false}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className={`grid grid-cols-1 ${editingData ? 'sm:grid-cols-1' : 'sm:grid-cols-3'} gap-4`}>
            <SearchableDropdown
              label="City / Location Name"
              name="city"
              placeholder="Ex: Bhavnagar"
              value={formData.city}
              items={cities}
              onChange={handleChange}
              onSelect={(id, value) => handleSelectOption('city', id, value)}
              onKeyDown={(e) => handleKeyDown(e, editingData ? submitRef : talukaRef)}
              isActive={activeDropdown === 'city'}
              setActive={setActiveDropdown}
              inputRef={cityRef}
              required
              icon={MapPin}
              isServerSearch={true}
              onLoadMore={cityPagination.handleLoadMore}
              hasMore={cityPagination.hasMore}
              loading={cityPagination.loading}
              allowTransliteration={false}
            />
            
            {!editingData && (
              <>
                <SearchableDropdown
                  label="Taluka"
                  name="taluka"
                  placeholder="Ex: Ghogha"
                  value={formData.taluka}
                  items={talukas}
                  onChange={handleChange}
                  onSelect={(id, value) => handleSelectOption('taluka', id, value)}
                  onKeyDown={(e) => handleKeyDown(e, villageRef)}
                  isActive={activeDropdown === 'taluka'}
                  setActive={setActiveDropdown}
                  disabled={!formData.city}
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
                  name="village"
                  placeholder="Ex: Rampar"
                  value={formData.village}
                  items={villages}
                  onChange={handleChange}
                  onSelect={(id, value) => handleSelectOption('village', id, value)}
                  onKeyDown={(e) => handleKeyDown(e, submitRef)}
                  isActive={activeDropdown === 'village'}
                  setActive={setActiveDropdown}
                  disabled={!formData.taluka}
                  inputRef={villageRef}
                  icon={MapPin}
                  isServerSearch={true}
                  onLoadMore={villagePagination.handleLoadMore}
                  hasMore={villagePagination.hasMore}
                  loading={villagePagination.loading}
                  allowTransliteration={false}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-100">
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
            {editingData ? 'Update Location' : 'Save Location'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddLocationModal;
