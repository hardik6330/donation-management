import React, { useState } from 'react';
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                <input
                  name="city"
                  list="city-list"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Bhavnagar"
                />
                <datalist id="city-list">
                  {cities.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Taluka</label>
                <input
                  name="taluka"
                  list="taluka-list"
                  value={formData.taluka}
                  onChange={handleChange}
                  disabled={!formData.city}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                  placeholder="Ex: Ghogha"
                />
                <datalist id="taluka-list">
                  {talukas.map(t => <option key={t.id} value={t.name} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Village</label>
                <input
                  name="village"
                  list="village-list"
                  value={formData.village}
                  onChange={handleChange}
                  disabled={!formData.taluka}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                  placeholder="Ex: Rampar"
                />
                <datalist id="village-list">
                  {villages.map(v => <option key={v.id} value={v.name} />)}
                </datalist>
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider border-b border-blue-50 pb-2">
              <Tag className="w-4 h-4" /> Category Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Category Name</label>
                <input
                  name="categoryName"
                  list="category-list"
                  value={formData.categoryName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ex: Gaushala"
                />
                <datalist id="category-list">
                  {categories.map(cat => <option key={cat.id} value={cat.name} />)}
                </datalist>
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
