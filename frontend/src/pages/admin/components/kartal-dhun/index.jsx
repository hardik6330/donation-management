import React, { useState } from 'react';
import KartalDhunList from './KartalDhunList';
import AddKartalDhunModal from './AddKartalDhunModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetKartalDhunQuery, 
  useDeleteKartalDhunMutation
} from '../../../../services/kartalDhunApi';
import { useTable } from '../../../../hooks/useTable';
import { toast } from 'react-toastify';

const KartalDhun = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const initialFilters = {
    search: '',
    startDate: '',
    endDate: '',
    city: '',
    page: 1,
    limit: 10
  };
  const { filters, handleFilterChange, clearFilters, handlePageChange, handleLimitChange } = useTable({
    initialFilters,
    allFlagKey: 'fetchAll',
    parseLimit: (value) => value,
  });

  // API calls moved to index.jsx
  const { data: listData, isLoading: loading } = useGetKartalDhunQuery(filters);
  const [deleteRecord, { isLoading: isDeleting }] = useDeleteKartalDhunMutation();

  const records = listData?.data?.rows || [];
  const pagination = {
    currentPage: listData?.data?.currentPage || 1,
    totalPages: listData?.data?.totalPages || 1,
    totalData: listData?.data?.totalData || 0,
    limit: listData?.data?.limit || 10
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteRecord(deletingId).unwrap();
      toast.success('Record deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete record');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Dhun Mandal Management" 
        subtitle="Manage and track dhun mandal records"
        buttonText={hasPermission('kartalDhun', 'entry') ? "Add Dhun Mandal Record" : null}
        onButtonClick={handleAdd}
      />

      <KartalDhunList 
        records={records}
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

      <AddKartalDhunModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRecord={editingRecord}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
      />
    </div>
  );
};

export default KartalDhun;
