import React, { useState } from 'react';
import LocationList from './LocationList';
import AddLocationModal from './AddLocationModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import {
  useGetAllCitiesQuery,
  useDeleteLocationMutation,
} from '../../../../services/masterApi';
import { useTable } from '../../../../hooks/useTable';
import { toast } from 'react-toastify';

const Location = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);

  const initialFilters = {
    search: '',
    page: 1,
    limit: 10
  };
  const { filters, handleFilterChange, clearFilters, handlePageChange, handleLimitChange } = useTable({
    initialFilters,
    allFlagKey: 'fetchAll',
    parseLimit: (value) => value,
  });

  const { data: citiesData, isFetching: isLoading } = useGetAllCitiesQuery(filters);
  const [deleteLocation, { isLoading: isDeleting }] = useDeleteLocationMutation();

  const locations = citiesData?.data?.data || [];
  const pagination = {
    currentPage: citiesData?.data?.currentPage || 1,
    totalPages: citiesData?.data?.totalPages || 1,
    totalData: citiesData?.data?.totalData || 0,
    limit: citiesData?.data?.limit || 10
  };

  const handleAdd = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteLocation(deletingId).unwrap();
      toast.success('Location deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete location');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Location Management"
        subtitle="Manage locations - City, State, Country"
        buttonText={hasPermission('location', 'entry') ? "Add Location" : null}
        onButtonClick={handleAdd}
      />

      <LocationList
        locations={locations}
        isLoading={isLoading}
        isDeleting={isDeleting}
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

      {isModalOpen && (
        <AddLocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingData={editingLocation}
          key={editingLocation?.id || 'new'}
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
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone and will only work if it has no sub-locations or linked donations."
      />
    </div>
  );
};

export default Location;
