import { useState } from 'react';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetExpensesQuery, 
  useDeleteExpenseMutation
} from '../../../../services/expenseApi';
import { 
  useLazyGetGaushalasQuery 
} from '../../../../services/gaushalaApi';
import { 
  useLazyGetKathasQuery 
} from '../../../../services/kathaApi';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { useTable } from '../../../../hooks/useTable';
import { toast } from 'react-toastify';

const Expense = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  const initialFilters = {
    startDate: '',
    endDate: '',
    category: '',
    gaushalaId: '',
    kathaId: '',
    minAmount: '',
    maxAmount: '',
    paymentMode: '',
    page: 1,
    limit: 10
  };
  const { filters, handleFilterChange, clearFilters, handlePageChange, handleLimitChange } = useTable({
    initialFilters,
    allFlagKey: 'fetchAll',
  });

  // API calls
  const { data: expensesData, isLoading: loading } = useGetExpensesQuery(filters);
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  // Dropdown Paginations
  const [triggerGetGaushalas] = useLazyGetGaushalasQuery();
  const gaushalaPagination = useDropdownPagination(triggerGetGaushalas, { rowsKey: 'rows' });

  const [triggerGetKathas] = useLazyGetKathasQuery();
  const kathaPagination = useDropdownPagination(triggerGetKathas, { rowsKey: 'rows' });

  const expenses = expensesData?.data?.rows || [];
  const pagination = {
    currentPage: expensesData?.data?.currentPage || 1,
    totalPages: expensesData?.data?.totalPages || 1,
    totalData: expensesData?.data?.totalData || 0,
    limit: expensesData?.data?.limit || 10
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteExpense(deletingId).unwrap();
      toast.success('Expense deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete expense');
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    gaushalaPagination.reset();
    kathaPagination.reset();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Expense Management" 
        subtitle="Track and manage all system expenses"
        buttonText={hasPermission('expenses', 'entry') ? "Add Expense" : null}
        onButtonClick={handleAdd}
      />

      <ExpenseList 
        expenses={expenses}
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
        gaushalaPagination={gaushalaPagination}
        kathaPagination={kathaPagination}
      />

      {isModalOpen && (
        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingExpense={editingExpense}
          gaushalaPagination={gaushalaPagination}
          kathaPagination={kathaPagination}
          key={editingExpense?.id || 'new'}
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
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </div>
  );
};

export default Expense;
