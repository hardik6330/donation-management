import { useState, useEffect, useRef } from 'react';
import {
  useAddCombinedMasterDataMutation,
  useUpdateLocationMutation,
  useGetCitiesQuery,
  useGetSubLocationsQuery
} from '../../../../services/apiSlice';
import { toast } from 'react-toastify';
import { MapPin, Plus, Loader2, CheckCircle2, Edit } from 'lucide-react';
import AdminModal from '../../../../components/common/AdminModal';

const AddLocationModal = ({ isOpen, onClose, editingData }) => {
  const [addCombinedMaster, { isLoading: isAdding }] = useAddCombinedMasterDataMutation();
  const [updateLocation, { isLoading: isUpdatingLocation }] = useUpdateLocationMutation();
  const isLoading = isAdding || isUpdatingLocation;

  const { data: citiesData } = useGetCitiesQuery();

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

  const { data: talukasData } = useGetSubLocationsQuery(formData.cityId, { skip: !formData.cityId });
  const { data: villagesData } = useGetSubLocationsQuery(formData.talukaId, { skip: !formData.talukaId });

  const cities = citiesData?.data || [];
  const talukas = talukasData?.data || [];
  const villages = villagesData?.data || [];

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
    }
  };

  const handleSelectOption = (name, value, id = '') => {
    if (name === 'city') {
      setFormData(prev => ({
        ...prev,
        city: value,
        cityId: id,
        taluka: '',
        talukaId: '',
        village: ''
      }));
    } else if (name === 'taluka') {
      setFormData(prev => ({
        ...prev,
        taluka: value,
        talukaId: id,
        village: ''
      }));
    } else if (name === 'village') {
      setFormData(prev => ({ ...prev, village: value }));
    }
    setActiveDropdown(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'city') {
      const selectedCity = cities.find(c => c.name === value);
      setFormData(prev => ({
        ...prev,
        city: value,
        cityId: selectedCity ? selectedCity.id : '',
        taluka: '',
        talukaId: '',
        village: ''
      }));
      setActiveDropdown('city');
      return;
    }

    if (name === 'taluka') {
      const selectedTaluka = talukas.find(t => t.name === value);
      setFormData(prev => ({
        ...prev,
        taluka: value,
        talukaId: selectedTaluka ? selectedTaluka.id : '',
        village: ''
      }));
      setActiveDropdown('taluka');
      return;
    }

    if (name === 'village') {
      setFormData(prev => ({ ...prev, village: value }));
      setActiveDropdown('village');
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

  const renderDropdown = (name, items, valueField = 'name', idField = 'id') => {
    const filteredItems = items.filter(item =>
      item[valueField].toLowerCase().includes((formData[name] || '').toLowerCase())
    );

    if (activeDropdown !== name || filteredItems.length === 0 || editingData) return null;

    return (
      <div
        className="absolute z-[110] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {filteredItems.map((item) => (
          <button
            key={item[idField] || item[valueField]}
            type="button"
            onClick={() => handleSelectOption(name, item[valueField], item[idField])}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm font-medium text-gray-700 transition-colors border-b border-gray-50 last:border-0"
          >
            {item[valueField]}
          </button>
        ))}
      </div>
    );
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingData ? "Edit Location" : "Add Location"}
      icon={editingData ? <Edit /> : <MapPin />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          {/* <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider border-b border-blue-50 pb-2">
            <MapPin className="w-4 h-4" /> {editingData ? 'Location Details' : 'Add New Location'}
          </div> */}
          <div className={`grid grid-cols-1 ${editingData ? 'sm:grid-cols-1' : 'sm:grid-cols-3'} gap-4`}>
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-gray-500 uppercase">City / Location Name</label>
              <input
                ref={cityRef}
                name="city"
                autoComplete="off"
                value={formData.city}
                onChange={handleChange}
                onFocus={() => setActiveDropdown('city')}
                onClick={(e) => { e.stopPropagation(); setActiveDropdown('city'); }}
                onKeyDown={(e) => handleKeyDown(e, editingData ? submitRef : talukaRef)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ex: Bhavnagar"
              />
              {renderDropdown('city', cities)}
            </div>
            
            {!editingData && (
              <>
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-gray-500 uppercase">Taluka</label>
                  <input
                    ref={talukaRef}
                    name="taluka"
                    autoComplete="off"
                    value={formData.taluka}
                    onChange={handleChange}
                    onFocus={() => setActiveDropdown('taluka')}
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown('taluka'); }}
                    onKeyDown={(e) => handleKeyDown(e, villageRef)}
                    disabled={!formData.city}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                    placeholder="Ex: Ghogha"
                  />
                  {renderDropdown('taluka', talukas)}
                </div>
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-gray-500 uppercase">Village</label>
                  <input
                    ref={villageRef}
                    name="village"
                    autoComplete="off"
                    value={formData.village}
                    onChange={handleChange}
                    onFocus={() => setActiveDropdown('village')}
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown('village'); }}
                    onKeyDown={(e) => handleKeyDown(e, submitRef)}
                    disabled={!formData.taluka}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                    placeholder="Ex: Rampar"
                  />
                  {renderDropdown('village', villages)}
                </div>
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
