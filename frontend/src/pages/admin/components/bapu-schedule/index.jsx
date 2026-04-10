import React, { useState } from 'react';
import BapuScheduleList from './BapuScheduleList';
import AddBapuScheduleModal from './AddBapuScheduleModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetBapuSchedulesQuery, 
  useDeleteBapuScheduleMutation,
  useLazyGetCitiesQuery,
  useLazyGetSubLocationsQuery 
} from '../../../../services/apiSlice';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { toast } from 'react-toastify';

const BapuSchedule = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventType: '',
    status: '',
    cityId: '',
    talukaId: '',
    villageId: '',
    locationId: '',
    search: '',
    page: 1,
    limit: 10
  });

  // API calls moved to index.jsx
  const { data: schedulesData, isLoading: loading } = useGetBapuSchedulesQuery(filters);
  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteBapuScheduleMutation();

  // Dropdown Paginations
  const [modalState, setModalState] = useState({ cityId: '', talukaId: '' });
  const [triggerGetCities] = useLazyGetCitiesQuery();
  const cityPagination = useDropdownPagination(triggerGetCities, { fields: 'id,name' });

  const [triggerGetTalukas] = useLazyGetSubLocationsQuery();
  const talukaPagination = useDropdownPagination(triggerGetTalukas, {
    fields: 'id,name',
    additionalParams: { parentId: filters.cityId || modalState.cityId },
    skip: !(filters.cityId || modalState.cityId)
  });

  const [triggerGetVillages] = useLazyGetSubLocationsQuery();
  const villagePagination = useDropdownPagination(triggerGetVillages, {
    fields: 'id,name',
    additionalParams: { parentId: filters.talukaId || modalState.talukaId },
    skip: !(filters.talukaId || modalState.talukaId)
  });

  const schedules = schedulesData?.data?.data || [];
  const pagination = {
    totalData: schedulesData?.data?.totalData || 0,
    totalPages: schedulesData?.data?.totalPages || 0,
    currentPage: schedulesData?.data?.currentPage || 1,
    limit: schedulesData?.data?.limit || 10
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSchedule(deletingId).unwrap();
      toast.success('Schedule deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete schedule');
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

    setFilters(prev => ({ ...prev, [name]: value, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (newLimit) => {
    if (newLimit === 'all') {
      setFilters(prev => ({ ...prev, fetchAll: true, limit: 100, page: 1 }));
    } else {
      setFilters(prev => ({ ...prev, limit: newLimit, fetchAll: false, page: 1 }));
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      eventType: '',
      status: '',
      cityId: '',
      talukaId: '',
      villageId: '',
      locationId: '',
      search: '',
      page: 1,
      limit: 10
    });
    cityPagination.reset();
    talukaPagination.reset();
    villagePagination.reset();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Bapu Schedule Management" 
        subtitle="Track Morari Bapu's upcoming katha events"
        buttonText={hasPermission('bapuSchedule', 'entry') ? "Add Schedule" : null}
        onButtonClick={handleAdd}
      />

      <BapuScheduleList 
        schedules={schedules}
        isLoading={loading}
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
        cityPagination={cityPagination}
        talukaPagination={talukaPagination}
        villagePagination={villagePagination}
      />

      {isModalOpen && (
        <AddBapuScheduleModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingSchedule={editingSchedule}
          cityPagination={cityPagination}
          talukaPagination={talukaPagination}
          villagePagination={villagePagination}
          setModalState={setModalState}
          key={editingSchedule?.id || 'new'}
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
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
      />
    </div>
  );
};

export default BapuSchedule;
