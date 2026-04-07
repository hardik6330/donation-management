import React, { useState } from 'react';
import { useGetCategoriesQuery, useUpdateCategoryMutation } from '../../../services/apiSlice';
import { Tag, Plus, Loader2 } from 'lucide-react';
import AddMasterData from './AddMasterData';
import { toast } from 'react-toastify';

const CategoryList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({ all: true });
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const categories = categoriesData?.data || [];

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await updateCategory({ id, isActive: !currentStatus }).unwrap();
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update category status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
          <p className="text-sm text-gray-500 font-medium">Add and organize system categories for donations</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 w-fit"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[10px] sm:text-xs uppercase">
                <th className="p-4 px-6 font-bold">Category Name</th>
                <th className="p-4 px-6 font-bold">Description</th>
                <th className="p-4 px-6 font-bold text-center">Total Donation</th>
                <th className="p-4 px-6 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categoriesLoading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 px-6 font-bold text-gray-800">{cat.name}</td>
                    <td className="p-4 px-6 text-sm text-gray-500">{cat.description || '-'}</td>
                    <td className="p-4 px-6 text-center font-bold text-blue-600">
                      ₹{Number(cat.totalDonation || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 px-6 flex justify-center items-center">
                      <label className="relative inline-flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={cat.isActive}
                          onChange={() => handleToggleStatus(cat.id, cat.isActive)}
                          disabled={isUpdating}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className={`ms-3 text-[10px] font-bold uppercase transition ${cat.isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500 text-sm">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <AddMasterData 
          type="category" 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default CategoryList;
