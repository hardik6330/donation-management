import React, { useState } from 'react';
import KartalDhunList from './KartalDhunList';
import AddKartalDhunModal from './AddKartalDhunModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetKartalDhunQuery, 
  useDeleteKartalDhunMutation,
  useLazyGetCitiesQuery,
  useLazyGetSubLocationsQuery
} from '../../../../services/apiSlice';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { toast } from 'react-toastify';

const KartalDhun = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    cityId: '',
    talukaId: '',
    villageId: '',
    page: 1,
    limit: 10
  });

  // API calls moved to index.jsx
  const { data: listData, isLoading: loading } = useGetKartalDhunQuery(filters);
  const [deleteRecord, { isLoading: isDeleting }] = useDeleteKartalDhunMutation();

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
    if (name === 'villageId') {
      setFilters(prev => ({ ...prev, villageId: value, page: 1 }));
      return;
    }

    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ 
      search: '', 
      startDate: '', 
      endDate: '', 
      cityId: '', 
      talukaId: '', 
      villageId: '', 
      page: 1, 
      limit: 10 
    });
    cityPagination.reset();
    talukaPagination.reset();
    villagePagination.reset();
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
        cityPagination={cityPagination}
        talukaPagination={talukaPagination}
        villagePagination={villagePagination}
      />

      <AddKartalDhunModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRecord={editingRecord}
        cityPagination={cityPagination}
        talukaPagination={talukaPagination}
        villagePagination={villagePagination}
        setModalState={setModalState}
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
