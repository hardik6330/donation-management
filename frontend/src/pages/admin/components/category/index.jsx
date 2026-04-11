import React, { useState } from 'react';
import CategoryList from './CategoryList';
import AddCategoryModal from './AddCategoryModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetCategoriesQuery, 
  useUpdateCategoryMutation, 
  useDeleteCategoryMutation,
  useLazyGetCategoriesQuery
} from '../../../../services/masterApi';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { toast } from 'react-toastify';

const Category = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10,
    all: true
  });
  const [editingCategory, setEditingCategory] = useState(null);

  // API calls
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery(filters);
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Dropdown Pagination for Modal (Auto-complete)
  const [triggerGetCategories] = useLazyGetCategoriesQuery();
  const categoryPagination = useDropdownPagination(triggerGetCategories, { 
    limit: 20, 
    fields: 'id,name',
    additionalParams: { all: true } 
  });
  
  const categories = categoriesData?.data?.data || [];
  const pagination = {
    currentPage: categoriesData?.data?.currentPage || 1,
    totalPages: categoriesData?.data?.totalPages || 1,
    totalData: categoriesData?.data?.totalData || 0,
    limit: categoriesData?.data?.limit || 10
  };

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

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(deletingId).unwrap();
      toast.success('Category deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete category');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      page: 1,
      limit: 10,
      all: true
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    if (newLimit === 'all') {
      setFilters(prev => ({ ...prev, fetchAll: true, limit: 100, page: 1 }));
    } else {
      setFilters(prev => ({ ...prev, limit: newLimit, fetchAll: false, page: 1 }));
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
        pagination={pagination}
        filters={filters}
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddCategoryModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingData={editingCategory}
          categoryPagination={categoryPagination}
          key={editingCategory?.id || 'new'}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone and will only work if no donations are linked to it."
      />
    </div>
  );
};

export default Category;
