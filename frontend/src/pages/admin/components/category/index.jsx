import React, { useState } from 'react';
import CategoryList from './CategoryList';
import AddCategoryModal from './AddCategoryModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetCategoriesQuery, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../../../../services/apiSlice';
import { toast } from 'react-toastify';

const Category = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // API calls moved to index.jsx
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery({ all: true });
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const categories = categoriesData?.data || [];

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await updateCategory({ id, isActive: !currentStatus }).unwrap();
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update category status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This will only work if no donations are linked to it.')) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Category deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Category Management" 
        subtitle="Add and organize system categories for donations"
        buttonText={hasPermission('category', 'entry') ? "Add Category" : null}
        onButtonClick={handleAdd}
      />

      <CategoryList 
        categories={categories}
        isLoading={categoriesLoading}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddCategoryModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingData={editingCategory}
          key={editingCategory?.id || 'new'}
        />
      )}
    </div>
  );
};

export default Category;
