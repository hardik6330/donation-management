import { useState } from 'react';
import { 
  useGetExpensesQuery, 
  useDeleteExpenseMutation,
  useGetGaushalasQuery
} from '../../../../services/apiSlice';
import { 
  Search, Calendar, Loader2, IndianRupee, Edit, Trash2, Filter, ChevronDown, Plus, Tag, Building2, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import AddExpenseModal from './AddExpenseModal';

const ExpenseList = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    gaushalaId: '',
    page: 1,
    limit: 10
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const { data: expensesData, isLoading: loading } = useGetExpensesQuery(filters);
  const { data: gaushalasData } = useGetGaushalasQuery({ fetchAll: 'true' });
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const gaushalas = gaushalasData?.data?.rows || [];
  const expenses = expensesData?.data?.rows || [];
  const pagination = {
    currentPage: expensesData?.data?.currentPage || 1,
    totalPages: expensesData?.data?.totalPages || 1,
    totalData: expensesData?.data?.totalData || 0,
    limit: expensesData?.data?.limit || 10
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
      page: 1,
      limit: 10
    });
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

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsAddModalOpen(true);
  };

  const tableHeaders = [
    { label: 'Date' },
    { label: 'Category' },
    { label: 'Amount' },
    { label: 'Gaushala' },
    { label: 'Payment Mode' },
    { label: 'Description' },
    { label: 'Actions' }
  ];

  const categories = ['Food', 'Medicine', 'Maintenance', 'Salary', 'Utility', 'Other'];

  const filterFields = [
    { name: 'startDate', label: 'Start Date', type: 'date', icon: Calendar },
    { name: 'endDate', label: 'End Date', type: 'date', icon: Calendar },
    { 
      name: 'category', 
      label: 'Category', 
      type: 'select', 
      icon: Tag,
      options: categories.map(cat => ({ value: cat, label: cat }))
    },
    { 
      name: 'gaushalaId', 
      label: 'Gaushala', 
      type: 'select', 
      icon: Building2,
      options: gaushalas.map(g => ({ value: g.id, label: g.name }))
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Expense Management" 
        subtitle="Track and manage all organizational expenses"
        buttonText="Add Expense"
        onButtonClick={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
      />

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        fields={filterFields}
      />

      {/* Table */}
      <AdminTable
        headers={tableHeaders}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
      >
        {expenses.map((expense) => (
          <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {new Date(expense.date).toLocaleDateString('en-IN')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                {expense.category}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              ₹{Number(expense.amount).toLocaleString('en-IN')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {expense.gaushala?.name || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
              {expense.paymentMode}
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
              {expense.description || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(expense)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={isDeleting}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {expenses.length === 0 && !loading && (
          <tr>
            <td colSpan={tableHeaders.length} className="px-6 py-12 text-center text-gray-500">
              No expenses found matching your filters.
            </td>
          </tr>
        )}
      </AdminTable>

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editingExpense={editingExpense}
      />
    </div>
  );
};

export default ExpenseList;
