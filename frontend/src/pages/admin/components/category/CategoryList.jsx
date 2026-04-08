import React, { useState } from 'react';
import { useGetCategoriesQuery, useUpdateCategoryMutation } from '../../../../services/apiSlice';
import { Tag, Plus, Loader2 } from 'lucide-react';
import AddMasterData from '../location/AddMasterData';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';

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

  const tableHeaders = [
    { label: 'Category Name' },
    { label: 'Description' },
    { label: 'Total Donation', className: 'text-center' },
    { label: 'Status', className: 'text-center' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Category Management" 
        subtitle="Add and organize system categories for donations"
        buttonText="Add Category"
        onButtonClick={() => setIsModalOpen(true)}
      />

      <AdminTable 
        headers={tableHeaders} 
        isLoading={categoriesLoading}
        emptyMessage="No categories found."
      >
        {categories.map((cat) => (
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
        ))}
      </AdminTable>

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
