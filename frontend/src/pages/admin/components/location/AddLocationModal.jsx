import { useState, useEffect, useRef } from 'react';
import {
  useAddCombinedMasterDataMutation,
  useUpdateLocationMutation,
  useLazyGetAllCitiesQuery
} from '../../../../services/masterApi';
import { toast } from 'react-toastify';
import { MapPin, Loader2, CheckCircle2, Edit } from 'lucide-react';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import FormInput from '../../../../components/common/FormInput';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';

const AddLocationModal = ({
  isOpen,
  onClose,
  editingData,
}) => {
  const [addCombinedMaster, { isLoading: isAdding }] = useAddCombinedMasterDataMutation();
  const [updateLocation, { isLoading: isUpdatingLocation }] = useUpdateLocationMutation();
  const isLoading = isAdding || isUpdatingLocation;

  const [formData, setFormData] = useState({  
    cityName: '',
    stateName: '',
    countryName: '',
  });

  const [activeDropdown, setActiveDropdown] = useState(null);

  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const countryRef = useRef(null);
  const submitRef = useRef(null);

  const fieldRefs = [cityRef, stateRef, countryRef, submitRef];

  const [triggerGetAllCities] = useLazyGetAllCitiesQuery();
  const cityPagination = useDropdownPagination(triggerGetAllCities);

  useEffect(() => {
    if (editingData) {
      setFormData({
        cityName: editingData.name || '',
        stateName: editingData.stateName || '',
        countryName: editingData.countryName || '',
      });
    } else {
      setFormData({ cityName: '', stateName: '', countryName: '' });
    }
  }, [editingData]);

  useEffect(() => {
    if (isOpen && cityRef.current) {
      cityRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = fieldRefs.findIndex(ref => ref.current === e.target);
      if (currentIndex > 0) fieldRefs[currentIndex - 1].current?.focus();
    }
  };

  const handleCitySelect = (id, name) => {
    const selectedCity = cityPagination.items.find(c => c.id === id);
    setFormData({
      cityName: name,
      stateName: selectedCity?.stateName || '',
      countryName: selectedCity?.countryName || '',
    });
    setActiveDropdown(null);
  };

  const handleCityInputChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      cityName: value,
      stateName: '',
      countryName: '',
    }));
    cityPagination.handleSearch(value);
    setActiveDropdown('cityName');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cityName) {
      toast.error('City name is required');
      return;
    }
    try {
      if (editingData) {
        await updateLocation({
          id: editingData.id,
          name: formData.cityName,
        }).unwrap();
        toast.success('Location updated successfully!');
      } else {
        await addCombinedMaster({
          country: formData.countryName,
          state: formData.stateName,
          city: formData.cityName,
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
              label="City"
              name="cityName"
              placeholder="Ex: Bhavnagar"
              value={formData.cityName}
              items={cityPagination.items}
              onChange={handleCityInputChange}
              onSelect={(id, name) => handleCitySelect(id, name)}
              onKeyDown={(e) => handleKeyDown(e, editingData ? submitRef : stateRef)}
              isActive={activeDropdown === 'cityName'}
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
                <FormInput
                  label="State"
                  name="stateName"
                  placeholder="Ex: Gujarat"
                  value={formData.stateName}
                  onChange={(e) => setFormData(prev => ({ ...prev, stateName: e.target.value }))}
                  onKeyDown={(e) => handleKeyDown(e, countryRef)}
                  inputRef={stateRef}
                  icon={MapPin}
                />
                <FormInput
                  label="Country"
                  name="countryName"
                  placeholder="Ex: India"
                  value={formData.countryName}
                  onChange={(e) => setFormData(prev => ({ ...prev, countryName: e.target.value }))}
                  onKeyDown={(e) => handleKeyDown(e, submitRef)}
                  inputRef={countryRef}
                  icon={MapPin}
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
