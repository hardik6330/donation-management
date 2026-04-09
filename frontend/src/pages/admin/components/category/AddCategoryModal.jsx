import { useState, useEffect, useRef } from 'react';
import {
  useAddCombinedMasterDataMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery
} from '../../../../services/apiSlice';
import { toast } from 'react-toastify';
import { Tag, Plus, Loader2, CheckCircle2, Edit } from 'lucide-react';
import AdminModal from '../../../../components/common/AdminModal';

const AddCategoryModal = ({ isOpen, onClose, editingData }) => {
  const [addCombinedMaster, { isLoading: isAdding }] = useAddCombinedMasterDataMutation();
  const [updateCategory, { isLoading: isUpdatingCategory }] = useUpdateCategoryMutation();
  const isLoading = isAdding || isUpdatingCategory;

  const getInitialState = () => {
    if (editingData) {
      return {
        categoryName: editingData.name || '',
        categoryDescription: editingData.description || '',
        isActive: editingData.isActive ?? true
      };
    }
    return {
      categoryName: '',
      categoryDescription: '',
      isActive: true
    };
  };

  const [formData, setFormData] = useState(getInitialState);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Refs for Fast Entry
  const categoryRef = useRef(null);
  const descriptionRef = useRef(null);
  const submitRef = useRef(null);

  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Fast Entry: Focus first field
  useEffect(() => {
    if (isOpen && categoryRef.current) {
      categoryRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  const handleSelectOption = (name, value) => {
    if (name === 'categoryName') {
      setFormData(prev => ({ ...prev, categoryName: value }));
    }
    setActiveDropdown(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

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
      if (editingData) {
        await updateCategory({
          id: editingData.id,
          name: formData.categoryName,
          description: formData.categoryDescription,
          isActive: formData.isActive
        }).unwrap();
        toast.success('Category updated successfully!');
      } else {
        await addCombinedMaster({
          categoryName: formData.categoryName,
          categoryDescription: formData.categoryDescription,
          isActive: formData.isActive
        }).unwrap();
        toast.success('Category saved successfully!');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save category');
    }
  };

  if (!isOpen) return null;

  const renderDropdown = (name, items, valueField = 'name') => {
    const filteredItems = items.filter(item =>
      item[valueField].toLowerCase().includes((formData[name] || '').toLowerCase())
    );

    if (activeDropdown !== name || filteredItems.length === 0 || editingData) return null;

    return (
      <div
        className="absolute z-[110] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {filteredItems.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectOption(name, item[valueField])}
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
      title={editingData ? "Edit Category" : "Add Category"}
      icon={editingData ? <Edit /> : <Tag />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          {/* <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider border-b border-blue-50 pb-2">
            <Tag className="w-4 h-4" /> {editingData ? 'Category Details' : 'Add New Category'}
          </div> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-gray-500 uppercase">Category Name</label>
              <input
                ref={categoryRef}
                name="categoryName"
                autoComplete="off"
                value={formData.categoryName}
                onChange={handleChange}
                onFocus={() => setActiveDropdown('category')}
                onClick={(e) => { e.stopPropagation(); setActiveDropdown('category'); }}
                onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ex: Gaushala"
              />
              {renderDropdown('categoryName', categories)}
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
                ref={descriptionRef}
                name="categoryDescription"
                value={formData.categoryDescription}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, submitRef)}
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
            ref={submitRef}
            type="submit"
            disabled={isLoading}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {editingData ? 'Update Category' : 'Save Category'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddCategoryModal;
