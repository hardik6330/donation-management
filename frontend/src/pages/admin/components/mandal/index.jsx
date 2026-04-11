import React, { useState } from 'react';
import MandalList from './MandalList';
import AddMandalModal from './AddMandalModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { NavLink } from 'react-router-dom';
import { UsersRound, IndianRupee } from 'lucide-react';
import { useGetMandalsQuery, useDeleteMandalMutation, useUpdateMandalMutation, useGenerateMandalPaymentsMutation } from '../../../../services/mandalApi';
import { toast } from 'react-toastify';

const Mandal = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingMandal, setEditingMandal] = useState(null);
  const [generatedMandals, setGeneratedMandals] = useState(new Set());

  const currentMonthValue = new Date().toISOString().slice(0, 7); // YYYY-MM format

  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    month: currentMonthValue,
    page: 1,
    limit: 10
  });

  // API calls moved to index.jsx
  const { data: mandalsData, isLoading: loading } = useGetMandalsQuery(filters);
  const [deleteMandal, { isLoading: isDeleting }] = useDeleteMandalMutation();
  const [updateMandal] = useUpdateMandalMutation();
  const [generatePayments, { isLoading: isGenerating }] = useGenerateMandalPaymentsMutation();

  const mandals = mandalsData?.data?.rows || [];
  const pagination = {
    currentPage: mandalsData?.data?.currentPage || 1,
    totalPages: mandalsData?.data?.totalPages || 1,
    totalData: mandalsData?.data?.totalData || 0,
    limit: mandalsData?.data?.limit || 10
  };

  const handleAdd = () => {
    setEditingMandal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (mandal) => {
    setEditingMandal(mandal);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMandal(deletingId).unwrap();
      toast.success('Mandal deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete mandal');
    }
  };

  const handleGeneratePayments = async (mandalId) => {
    const monthToGenerate = filters.month || currentMonthValue;
    const [year, monthNum] = monthToGenerate.split('-');
    const monthName = new Date(year, parseInt(monthNum) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    
    if (!window.confirm(`Generate payments for ${monthName}?`)) return;
    try {
      const result = await generatePayments({ mandalId, month: monthToGenerate }).unwrap();
      setGeneratedMandals(prev => new Set([...prev, mandalId]));
      if (result?.data?.generated === 0) {
        toast.info('Payments already generated for this month');
      } else {
        toast.success(result?.message || 'Monthly payments generated successfully');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to generate payments');
    }
  };

  const handleToggleStatus = async (mandal) => {
    try {
      await updateMandal({ id: mandal.id, isActive: !mandal.isActive }).unwrap();
      toast.success(`Mandal ${mandal.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', isActive: '', month: currentMonthValue, page: 1, limit: 10 });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    if (newLimit === 'all') {
      setFilters(prev => ({ ...prev, limit: 100, page: 1, fetchAll: true }));
    } else {
      setFilters(prev => ({ ...prev, limit: Number(newLimit), page: 1, fetchAll: false }));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Mandal Management" 
        subtitle="Manage mandals, members and monthly collections"
        buttonText={hasPermission('mandal', 'entry') ? "Create Mandal" : null}
        onButtonClick={handleAdd}
      />

      <div className="flex flex-wrap gap-3">
        <NavLink to="/admin/mandal-members" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition text-sm border border-blue-100">
          <UsersRound className="w-4 h-4" /> Members
        </NavLink>
        <NavLink to="/admin/mandal-payments" className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition text-sm border border-green-100">
          <IndianRupee className="w-4 h-4" /> Payments
        </NavLink>
      </div>

      <MandalList
        mandals={mandals}
        isLoading={loading}
        isDeleting={isDeleting}
        isGenerating={isGenerating}
        generatedMandals={generatedMandals}
        pagination={pagination}
        filters={filters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onGeneratePayments={handleGeneratePayments}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddMandalModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingMandal={editingMandal}
          key={editingMandal?.id || 'new'}
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
        title="Delete Mandal"
        message="Are you sure you want to delete this mandal? All members and payments will be lost. This action cannot be undone."
      />
    </div>
  );
};

export default Mandal;
