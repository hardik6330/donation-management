import React, { useState, useEffect } from 'react';
import { 
  useAddCombinedMasterDataMutation,
  useGetCitiesQuery,
  useGetSubLocationsQuery,
  useGetCategoriesQuery
} from '../../../services/apiSlice';
import { toast } from 'react-toastify';
import { MapPin, Tag, Plus, Loader2, X, CheckCircle2 } from 'lucide-react';

const AddMasterData = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    city: '',
    cityId: '',
    taluka: '',
    talukaId: '',
    village: '',
    categoryName: '',
    categoryDescription: '',
    isActive: true
  });

  const [activeDropdown, setActiveDropdown] = useState(null); // 'city', 'taluka', 'village', 'category'

  // Fetch Master Data for suggestions
  const { data: citiesData } = useGetCitiesQuery();
  const { data: talukasData } = useGetSubLocationsQuery(formData.cityId, { skip: !formData.cityId });
  const { data: villagesData } = useGetSubLocationsQuery(formData.talukaId, { skip: !formData.talukaId });
  const { data: categoriesData } = useGetCategoriesQuery();

  const cities = citiesData?.data || [];
  const talukas = talukasData?.data || [];
  const villages = villagesData?.data || [];
  const categories = categoriesData?.data || [];

  const [addCombinedMaster, { isLoading }] = useAddCombinedMasterDataMutation();

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
    } else if (name === 'categoryName') {
      setFormData(prev => ({ ...prev, categoryName: value }));
    }
    setActiveDropdown(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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

    if (name === 'categoryName') {
      setFormData(prev => ({ ...prev, categoryName: value }));
      setActiveDropdown('category');
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCombinedMaster({
        city: formData.city,
        taluka: formData.taluka,
        village: formData.village,
        categoryName: formData.categoryName,
        categoryDescription: formData.categoryDescription,
        isActive: formData.isActive
      }).unwrap();
      toast.success('Master data saved successfully!');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save master data');
    }
  };

  if (!isOpen) return null;

  const renderDropdown = (name, items, valueField = 'name', idField = 'id') => {
    const filteredItems = items.filter(item => 
      item[valueField].toLowerCase().includes((formData[name === 'category' ? 'categoryName' : name] || '').toLowerCase())
    );

    if (activeDropdown !== name || filteredItems.length === 0) return null;

    return (
      <div 
        className="absolute z-[110] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {filteredItems.map((item) => (
          <button
            key={item[idField] || item[valueField]}
            type="button"
            onClick={() => handleSelectOption(name === 'category' ? 'categoryName' : name, item[valueField], item[idField])}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm font-medium text-gray-700 transition-colors border-b border-gray-50 last:border-0"
          >
            {item[valueField]}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Add Master Data</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider border-b border-blue-50 pb-2">
              <MapPin className="w-4 h-4" /> Location Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                <input
                  name="city"
                  autoComplete="off"
                  value={formData.city}
                  onChange={handleChange}
                  onFocus={() => setActiveDropdown('city')}
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown('city'); }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Bhavnagar"
                />
                {renderDropdown('city', cities)}
              </div>
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 uppercase">Taluka</label>
                <input
                  name="taluka"
                  autoComplete="off"
                  value={formData.taluka}
                  onChange={handleChange}
                  onFocus={() => setActiveDropdown('taluka')}
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown('taluka'); }}
                  disabled={!formData.city}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                  placeholder="Ex: Ghogha"
                />
                {renderDropdown('taluka', talukas)}
              </div>
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 uppercase">Village</label>
                <input
                  name="village"
                  autoComplete="off"
                  value={formData.village}
                  onChange={handleChange}
                  onFocus={() => setActiveDropdown('village')}
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown('village'); }}
                  disabled={!formData.taluka}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                  placeholder="Ex: Rampar"
                />
                {renderDropdown('village', villages)}
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider border-b border-blue-50 pb-2">
              <Tag className="w-4 h-4" /> Category Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 uppercase">Category Name</label>
                <input
                  name="categoryName"
                  autoComplete="off"
                  value={formData.categoryName}
                  onChange={handleChange}
                  onFocus={() => setActiveDropdown('category')}
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown('category'); }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Gaushala"
                />
                {renderDropdown('category', categories)}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <div className="flex items-center h-[42px]">
                  <label className="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      name="isActive"
                      className="sr-only peer"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className={`ms-3 text-sm font-bold transition ${formData.isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                <textarea
                  name="categoryDescription"
                  value={formData.categoryDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none h-24"
                  placeholder="About this category..."
                />
              </div>
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
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Save Master Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMasterData;
