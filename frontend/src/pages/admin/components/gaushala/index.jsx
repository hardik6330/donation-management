import React, { useState } from 'react';
import GaushalaList from './GaushalaList';
import AddGaushalaModal from './AddGaushalaModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetGaushalasQuery, 
  useDeleteGaushalaMutation
} from '../../../../services/gaushalaApi';
import { useTable } from '../../../../hooks/useTable';
import { toast } from 'react-toastify';

const Gaushala = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingGaushala, setEditingGaushala] = useState(null);

  const initialFilters = {
    search: '',
    gaushalaName: '',
    city: '',
    state: '',
    page: 1,
    limit: 10
  };
  const { filters, handleFilterChange, clearFilters, handlePageChange, handleLimitChange } = useTable({
    initialFilters,
    allFlagKey: 'fetchAll',
    allFlagType: 'string',
    parseLimit: (value) => value,
  });

  const { data: gaushalasData, isLoading: loading } = useGetGaushalasQuery(filters);
  const [deleteGaushala, { isLoading: isDeleting }] = useDeleteGaushalaMutation();

  const gaushalas = gaushalasData?.data?.rows || [];
  const pagination = {
    currentPage: gaushalasData?.data?.currentPage || 1,
    totalPages: gaushalasData?.data?.totalPages || 1,
    totalData: gaushalasData?.data?.totalData || 0,
    limit: gaushalasData?.data?.limit || 10
  };

  const handleAdd = () => {
    setEditingGaushala(null);
    setIsModalOpen(true);
  };

  const handleEdit = (gaushala) => {
    setEditingGaushala(gaushala);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteGaushala(deletingId).unwrap();
      toast.success('Gaushala deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete gaushala');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Gaushala Management" 
        subtitle="Manage different gaushalas for donation tracking"
        buttonText={hasPermission('gaushala', 'entry') ? "Add Gaushala" : null}
        onButtonClick={handleAdd}
      />

      <GaushalaList
        gaushalas={gaushalas}
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

      <AddGaushalaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingGaushala={editingGaushala}
        key={editingGaushala?.id || 'new'}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Gaushala"
        message="Are you sure you want to delete this gaushala? This action cannot be undone."
      />
    </div>
  );
};

export default Gaushala;
