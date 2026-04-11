import React, { useState } from 'react';
import SevakList from './SevakList';
import AddSevakModal from './AddSevakModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetSevaksQuery, useDeleteSevakMutation, useUpdateSevakMutation } from '../../../../services/sevakApi';
import { toast } from 'react-toastify';

const Sevak = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSevak, setEditingSevak] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    city: '',
    state: '',
    isActive: '',
    page: 1,
    limit: 10
  });

  // API calls moved to index.jsx
  const { data: sevaksData, isLoading: loading } = useGetSevaksQuery(filters);
  const [deleteSevak, { isLoading: isDeleting }] = useDeleteSevakMutation();
  const [updateSevak] = useUpdateSevakMutation();

  const sevaks = sevaksData?.data?.rows || [];
  const pagination = {
    currentPage: sevaksData?.data?.currentPage || 1,
    totalPages: sevaksData?.data?.totalPages || 1,
    totalData: sevaksData?.data?.totalData || 0,
    limit: sevaksData?.data?.limit || 10
  };

  const handleAdd = () => {
    setEditingSevak(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sevak) => {
    setEditingSevak(sevak);
    setIsModalOpen(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      state: '',
      isActive: '',
      page: 1,
      limit: 10
    });
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSevak(deletingId).unwrap();
      toast.success('Sevak deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete sevak');
    }
  };

  const handleToggleStatus = async (sevak) => {
    try {
      await updateSevak({ id: sevak.id, isActive: !sevak.isActive }).unwrap();
      toast.success(`Sevak ${sevak.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Sevak Management" 
        subtitle="Manage and track system sevaks"
        buttonText={hasPermission('sevaks', 'entry') ? "Add Sevak" : null}
        onButtonClick={handleAdd}
      />

      <SevakList 
        sevaks={sevaks}
        isLoading={loading}
        isDeleting={isDeleting}
        pagination={pagination}
        filters={filters}
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddSevakModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingSevak={editingSevak}
          key={editingSevak?.id || 'new'}
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
        title="Delete Sevak"
        message="Are you sure you want to delete this sevak? This action cannot be undone."
      />
    </div>
  );
};

export default Sevak;
