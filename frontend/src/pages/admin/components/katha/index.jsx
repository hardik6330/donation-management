import React, { useState } from 'react';
import KathaList from './KathaList';
import AddKathaModal from './AddKathaModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import {
  useGetKathasQuery,
  useDeleteKathaMutation
} from '../../../../services/kathaApi';
import { toast } from 'react-toastify';

const Katha = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingKatha, setEditingKatha] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    city: '',
    state: '',
    page: 1,
    limit: 10
  });

  const { data: kathasData, isLoading: loading } = useGetKathasQuery(filters);
  const [deleteKatha, { isLoading: isDeleting }] = useDeleteKathaMutation();

  const kathas = kathasData?.data?.rows || [];
  const pagination = {
    currentPage: kathasData?.data?.currentPage || 1,
    totalPages: kathasData?.data?.totalPages || 1,
    totalData: kathasData?.data?.totalData || 0,
    limit: kathasData?.data?.limit || 10
  };

  const handleAdd = () => {
    setEditingKatha(null);
    setIsModalOpen(true);
  };

  const handleEdit = (katha) => {
    setEditingKatha(katha);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteKatha(deletingId).unwrap();
      toast.success('Katha deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete katha');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', city: '', state: '', page: 1, limit: 10 });
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
        title="Katha Management"
        subtitle="Manage different kathas for donation tracking"
        buttonText={hasPermission('katha', 'entry') ? "Add Katha" : null}
        onButtonClick={handleAdd}
      />

      <KathaList
        kathas={kathas}
        isLoading={loading}
        pagination={pagination}
        filters={filters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        hasPermission={hasPermission}
      />

      <AddKathaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingKatha={editingKatha}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Katha"
        message="Are you sure you want to delete this katha? This action cannot be undone."
      />
    </div>
  );
};

export default Katha;
