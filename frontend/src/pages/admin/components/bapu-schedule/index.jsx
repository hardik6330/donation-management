import React, { useState } from 'react';
import BapuScheduleList from './BapuScheduleList';
import AddBapuScheduleModal from './AddBapuScheduleModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetBapuSchedulesQuery, 
  useDeleteBapuScheduleMutation
} from '../../../../services/bapuApi';
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
    city: '',
    state: '',
    country: '',
    page: 1,
    limit: 10
  });

  // API calls moved to index.jsx
  const { data: schedulesData, isLoading: loading } = useGetBapuSchedulesQuery(filters);
  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteBapuScheduleMutation();

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
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
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
      city: '',
      state: '',
      country: '',
      page: 1,
      limit: 10
    });
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
        <AddBapuScheduleModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingSchedule={editingSchedule}
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
