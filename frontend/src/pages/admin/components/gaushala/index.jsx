import React, { useState } from 'react';
import GaushalaList from './GaushalaList';
import AddGaushalaModal from './AddGaushalaModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetGaushalasQuery, useDeleteGaushalaMutation, useGetCitiesQuery, useGetSubLocationsQuery } from '../../../../services/apiSlice';
import { toast } from 'react-toastify';

const Gaushala = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGaushala, setEditingGaushala] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    gaushalaName: '',
    cityId: '',
    talukaId: '',
    villageId: '',
    page: 1,
    limit: 10
  });

  const locationId = filters.villageId || filters.talukaId || filters.cityId;
  const { data: gaushalasData, isLoading: loading } = useGetGaushalasQuery({ ...filters, locationId });
  const [deleteGaushala, { isLoading: isDeleting }] = useDeleteGaushalaMutation();

  const { data: citiesData } = useGetCitiesQuery();
  const { data: talukasData } = useGetSubLocationsQuery(filters.cityId, { skip: !filters.cityId });
  const { data: villagesData } = useGetSubLocationsQuery(filters.talukaId, { skip: !filters.talukaId });

  const cities = citiesData?.data || [];
  const talukas = talukasData?.data || [];
  const villages = villagesData?.data || [];
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gaushala?')) {
      try {
        await deleteGaushala(id).unwrap();
        toast.success('Gaushala deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete gaushala');
      }
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
    setFilters({ search: '', gaushalaName: '', cityId: '', talukaId: '', villageId: '', page: 1, limit: 10 });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
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
        cities={cities}
        talukas={talukas}
        villages={villages}
        isLoading={loading}
        isDeleting={isDeleting}
        pagination={pagination}
        filters={filters}
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddGaushalaModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingGaushala={editingGaushala}
          key={editingGaushala?.id || 'new'}
        />
      )}
    </div>
  );
};

export default Gaushala;
