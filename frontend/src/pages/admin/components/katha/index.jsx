import React, { useState } from 'react';
import KathaList from './KathaList';
import AddKathaModal from './AddKathaModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetKathasQuery, useDeleteKathaMutation, useGetCitiesQuery, useGetSubLocationsQuery } from '../../../../services/apiSlice';
import { toast } from 'react-toastify';

const Katha = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingKatha, setEditingKatha] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    cityId: '',
    talukaId: '',
    villageId: '',
    page: 1,
    limit: 10
  });

  const locationId = filters.villageId || filters.talukaId || filters.cityId;
  const { data: kathasData, isLoading: loading } = useGetKathasQuery({ ...filters, locationId });
  const [deleteKatha, { isLoading: isDeleting }] = useDeleteKathaMutation();

  const { data: citiesData } = useGetCitiesQuery();
  const { data: talukasData } = useGetSubLocationsQuery(filters.cityId, { skip: !filters.cityId });
  const { data: villagesData } = useGetSubLocationsQuery(filters.talukaId, { skip: !filters.talukaId });

  const cities = citiesData?.data || [];
  const talukas = talukasData?.data || [];
  const villages = villagesData?.data || [];
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
    if (name === 'cityId') {
      setFilters(prev => ({ ...prev, cityId: value, talukaId: '', villageId: '', page: 1 }));
      return;
    }
    if (name === 'talukaId') {
      setFilters(prev => ({ ...prev, talukaId: value, villageId: '', page: 1 }));
      return;
    }
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', cityId: '', talukaId: '', villageId: '', page: 1, limit: 10 });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
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
        cities={cities}
        talukas={talukas}
        villages={villages}
        isLoading={loading}
        pagination={pagination}
        filters={filters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
        hasPermission={hasPermission}
      />

      <AddKathaModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingKatha={editingKatha}
        cities={cities}
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
