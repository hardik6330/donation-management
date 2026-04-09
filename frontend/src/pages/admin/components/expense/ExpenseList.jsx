import React from 'react';
import {
  Calendar, IndianRupee, Edit, Trash2, Tag, Building2, Mic2, CreditCard
} from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';

const ExpenseList = ({
  expenses,
  gaushalas,
  kathas,
  isLoading,
  isDeleting,
  pagination,
  filters,
  onEdit,
  onDelete,
  onFilterChange,
  onClearFilters,
  onPageChange,
  hasPermission
}) => {
  const tableHeaders = [
    { label: 'Date' },
    { label: 'Category' },
    { label: 'Amount' },
    { label: 'Gaushala / Katha' },
    { label: 'Payment Mode', className: 'text-center' },
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
    },
    {
      name: 'kathaId',
      label: 'Katha',
      type: 'select',
      icon: Mic2,
      options: kathas.map(k => ({ value: k.id, label: k.name }))
    },
    { name: 'minAmount', label: 'Min Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 0' },
    { name: 'maxAmount', label: 'Max Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 10000+' },
    {
      name: 'paymentMode',
      label: 'Payment Mode',
      type: 'select',
      icon: CreditCard,
      options: [
        { value: 'cash', label: 'Cash' },
        { value: 'online', label: 'Online' },
        { value: 'check', label: 'Check' }
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <FilterSection
        fields={filterFields}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />

      <AdminTable
        headers={tableHeaders}
        isLoading={isLoading}
        emptyMessage="No expenses found."
      >
        {expenses.map((expense) => (
          <tr key={expense.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 text-sm text-gray-500">
              {new Date(expense.date).toLocaleDateString('en-IN')}
            </td>
            <td className="p-4 px-6 font-bold text-gray-800">{expense.category}</td>
            <td className="p-4 px-6 text-blue-600 font-bold">
              <div className="flex items-center gap-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(expense.amount).toLocaleString('en-IN')}
              </div>
            </td>
            <td className="p-4 px-6">
              {expense.gaushala?.name ? (
                <span className="text-xs font-bold text-green-600 uppercase">Gaushala: {expense.gaushala.name}</span>
              ) : expense.katha?.name ? (
                <span className="text-xs font-bold text-purple-600 uppercase">Katha: {expense.katha.name}</span>
              ) : (
                <span className="text-sm text-gray-400">General</span>
              )}
            </td>
            <td className="p-4 px-6 text-center">
              <span className={`text-xs font-bold uppercase ${
                expense.paymentMode === 'cash' ? 'text-blue-600' :
                expense.paymentMode === 'online' ? 'text-purple-600' :
                'text-orange-600'
              }`}>
                {expense.paymentMode}
              </span>
            </td>
            <td className="p-4 px-6 text-sm text-gray-500 max-w-xs truncate">
              {expense.description || '-'}
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2">
                {hasPermission('expenses', 'entry') && (
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('expenses', 'full') && (
                  <button
                    onClick={() => onDelete(expense.id)}
                    disabled={isDeleting}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">
            Showing <span className="font-bold text-blue-600">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span> records
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={filters.page === 1}
              onClick={() => onPageChange(filters.page - 1)}
              className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 text-sm font-bold rounded-lg transition ${
                  filters.page === page
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={filters.page === pagination.totalPages}
              onClick={() => onPageChange(filters.page + 1)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
