import React, { useState } from 'react';
import KartalDhunList from './KartalDhunList';
import AddKartalDhunModal from './AddKartalDhunModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetKartalDhunQuery, useDeleteKartalDhunMutation } from '../../../../services/apiSlice';
import { toast } from 'react-toastify';

const KartalDhun = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });

  // API calls moved to index.jsx
  const { data: listData, isLoading: loading } = useGetKartalDhunQuery(filters);
  const [deleteRecord, { isLoading: isDeleting }] = useDeleteKartalDhunMutation();

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

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      try {
        await deleteRecord(id).unwrap();
        toast.success('Record deleted');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', startDate: '', endDate: '', page: 1, limit: 10 });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Kartal Dhun Income" 
        subtitle="Track and manage kartal dhun income records"
        buttonText={hasPermission('kartalDhun', 'entry') ? "Add Income" : null}
        onButtonClick={handleAdd}
      />

      <KartalDhunList 
        records={records}
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
        <AddKartalDhunModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingRecord={editingRecord}
          key={editingRecord?.id || 'new'}
        />
      )}
    </div>
  );
};

export default KartalDhun;
