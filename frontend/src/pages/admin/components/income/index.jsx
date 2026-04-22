import { useState } from 'react';
import IncomeList from './IncomeList';
import AddIncomeModal from './AddIncomeModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetIncomeQuery, 
  useDeleteIncomeMutation
} from '../../../../services/incomeApi';
import { useTable } from '../../../../hooks/useTable';
import { toast } from 'react-toastify';

const Income = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);

  const initialFilters = {
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    page: 1,
    limit: 10
  };
  const { filters, handleFilterChange, clearFilters, handlePageChange, handleLimitChange } = useTable({
    initialFilters,
    allFlagKey: 'fetchAll',
  });

  // API calls
  const { data: incomeData, isLoading: loading } = useGetIncomeQuery(filters);
  const [deleteIncome, { isLoading: isDeleting }] = useDeleteIncomeMutation();

  const income = incomeData?.data?.items || [];
  const pagination = {
    currentPage: incomeData?.data?.currentPage || 1,
    totalPages: incomeData?.data?.totalPages || 1,
    totalData: incomeData?.data?.totalData || 0,
    limit: incomeData?.data?.limit || 10
  };

  const handleAdd = () => {
    setEditingIncome(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingIncome(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteIncome(deletingId).unwrap();
      toast.success('Income deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete income');
    }
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Income Management" 
        subtitle="Track and manage all system income"
        buttonText={hasPermission('income', 'entry') ? "Add Income" : null}
        onButtonClick={handleAdd}
      />

      <IncomeList 
        income={income}
        isLoading={loading}
        isDeleting={isDeleting}
        pagination={pagination}
        filters={filters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        hasPermission={hasPermission}
      />

      {isModalOpen && (
        <AddIncomeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingIncome={editingIncome}
          key={editingIncome?.id || 'new'}
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
        title="Delete Income"
        message="Are you sure you want to delete this income record? This action cannot be undone."
      />
    </div>
  );
};

export default Income;
