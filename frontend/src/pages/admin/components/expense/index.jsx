import React, { useState } from 'react';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetExpensesQuery, useDeleteExpenseMutation, useGetGaushalasQuery, useGetKathasQuery } from '../../../../services/apiSlice';
import { toast } from 'react-toastify';

const Expense = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [filters, setFilters] = useState({
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
  });

  // API calls moved to index.jsx
  const { data: expensesData, isLoading: loading } = useGetExpensesQuery(filters);
  const { data: gaushalasData } = useGetGaushalasQuery({ fetchAll: 'true' });
  const { data: kathasData } = useGetKathasQuery({ fetchAll: 'true' });
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const gaushalas = gaushalasData?.data?.rows || [];
  const kathas = kathasData?.data?.rows || [];
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id).unwrap();
        toast.success('Expense deleted successfully');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete expense');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
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
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Expense Management" 
        subtitle="Track and manage system expenses"
        buttonText={hasPermission('expenses', 'entry') ? "Add Expense" : null}
        onButtonClick={handleAdd}
      />

      <ExpenseList
        expenses={expenses}
        gaushalas={gaushalas}
        kathas={kathas}
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
        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingExpense={editingExpense}
          key={editingExpense?.id || 'new'}
        />
      )}
    </div>
  );
};

export default Expense;
