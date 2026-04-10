import React, { useState } from 'react';
import KartalDhunList from './KartalDhunList';
import AddKartalDhunModal from './AddKartalDhunModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetKartalDhunQuery, 
  useDeleteKartalDhunMutation,
  useGetCitiesQuery,
  useGetSubLocationsQuery
} from '../../../../services/apiSlice';
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

  // Location Data for Filters
  const { data: filterCitiesData } = useGetCitiesQuery();
  const { data: filterTalukasData } = useGetSubLocationsQuery(filters.cityId, { skip: !filters.cityId });
  const { data: filterVillagesData } = useGetSubLocationsQuery(filters.talukaId, { skip: !filters.talukaId });

  const filterCities = filterCitiesData?.data || [];
  const filterTalukas = filterTalukasData?.data || [];
  const filterVillages = filterVillagesData?.data || [];

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
      return;
    }
    if (name === 'talukaId') {
      setFilters(prev => ({ ...prev, talukaId: value, villageId: '', page: 1 }));
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
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Kartal Dhun Management" 
        subtitle="Manage and track kartal dhun records"
        buttonText={hasPermission('kartalDhun', 'entry') ? "Add Record" : null}
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
        hasPermission={hasPermission}
        cities={filterCities}
        talukas={filterTalukas}
        villages={filterVillages}
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
