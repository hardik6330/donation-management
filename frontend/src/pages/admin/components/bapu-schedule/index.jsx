import React, { useState } from 'react';
import BapuScheduleList from './BapuScheduleList';
import AddBapuScheduleModal from './AddBapuScheduleModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetBapuSchedulesQuery, 
  useDeleteBapuScheduleMutation,
  useGetCitiesQuery,
  useGetSubLocationsQuery 
} from '../../../../services/apiSlice';
import { toast } from 'react-toastify';

const BapuSchedule = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Location Data for Filters
  const { data: filterCitiesData } = useGetCitiesQuery();
  const { data: filterTalukasData } = useGetSubLocationsQuery(filters.cityId, { skip: !filters.cityId });
  const { data: filterVillagesData } = useGetSubLocationsQuery(filters.talukaId, { skip: !filters.talukaId });

  const filterCities = filterCitiesData?.data || [];
  const filterTalukas = filterTalukasData?.data || [];
  const filterVillages = filterVillagesData?.data || [];

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(id).unwrap();
        toast.success('Schedule deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete schedule');
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
    if (name === 'villageId') {
      setFilters(prev => ({ ...prev, villageId: value, page: 1 }));
      return;
    }

    setFilters(prev => ({ ...prev, [name]: value, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => setFilters({
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

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Bapu Schedule" 
        subtitle="Manage and track Bapu's upcoming events and schedule"
        buttonText={hasPermission('bapuSchedule', 'entry') ? "Add Schedule" : null}
        onButtonClick={handleAdd}
      />

      <BapuScheduleList 
        schedules={schedules}
        isLoading={loading}
        isDeleting={isDeleting}
        pagination={pagination}
        filters={filters}
        filterData={{
          cities: filterCities,
          talukas: filterTalukas,
          villages: filterVillages
        }}
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddBapuScheduleModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingSchedule={editingSchedule}
          key={editingSchedule?.id || 'new'}
        />
      )}
    </div>
  );
};

export default BapuSchedule;
