import React, { useState } from 'react';
import GaushalaList from './GaushalaList';
import AddGaushalaModal from './AddGaushalaModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetGaushalasQuery, 
  useDeleteGaushalaMutation, 
  useLazyGetCitiesQuery, 
  useLazyGetSubLocationsQuery 
} from '../../../../services/apiSlice';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { toast } from 'react-toastify';

const Gaushala = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
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

  // Dropdown Paginations
  const [modalState, setModalState] = useState({ cityId: '', talukaId: '' });
  const [triggerGetCities] = useLazyGetCitiesQuery();
  const cityPagination = useDropdownPagination(triggerGetCities);

  const [triggerGetTalukas] = useLazyGetSubLocationsQuery();
  const talukaPagination = useDropdownPagination(triggerGetTalukas, {
    additionalParams: { parentId: filters.cityId || modalState.cityId },
    skip: !(filters.cityId || modalState.cityId)
  });

  const [triggerGetVillages] = useLazyGetSubLocationsQuery();
  const villagePagination = useDropdownPagination(triggerGetVillages, {
    additionalParams: { parentId: filters.talukaId || modalState.talukaId },
    skip: !(filters.talukaId || modalState.talukaId)
  });

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cityId') {
      setFilters(prev => ({ ...prev, cityId: value, talukaId: '', villageId: '', page: 1 }));
      talukaPagination.reset();
      villagePagination.reset();
      return;
    }
    if (name === 'talukaId') {
      setFilters(prev => ({ ...prev, talukaId: value, villageId: '', page: 1 }));
      villagePagination.reset();
      return;
    }
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', gaushalaName: '', cityId: '', talukaId: '', villageId: '', page: 1, limit: 10 });
    cityPagination.reset();
    talukaPagination.reset();
    villagePagination.reset();
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    if (newLimit === 'all') {
      setFilters(prev => ({ ...prev, fetchAll: 'true', limit: 100, page: 1 }));
    } else {
      setFilters(prev => ({ ...prev, limit: newLimit, fetchAll: 'false', page: 1 }));
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
        cityPagination={cityPagination}
        talukaPagination={talukaPagination}
        villagePagination={villagePagination}
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
        cityPagination={cityPagination}
        talukaPagination={talukaPagination}
        villagePagination={villagePagination}
        setModalState={setModalState}
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
