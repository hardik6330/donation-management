import React, { useState } from 'react';
import BapuScheduleList from './BapuScheduleList';
import AddBapuScheduleModal from './AddBapuScheduleModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetBapuSchedulesQuery, useDeleteBapuScheduleMutation } from '../../../../services/apiSlice';
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
    locationId: '',
    search: '',
    page: 1,
    limit: 10
  });

  // API calls moved to index.jsx
  const { data: schedulesData, isLoading: loading } = useGetBapuSchedulesQuery(filters);
  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteBapuScheduleMutation();

  const schedules = schedulesData?.data?.rows || schedulesData?.data || [];

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
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => setFilters({
    startDate: '',
    endDate: '',
    eventType: '',
    status: '',
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
        filters={filters}
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
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
