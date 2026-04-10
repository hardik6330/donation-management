import React from 'react';
import {
  Calendar, IndianRupee, Edit, Trash2, Tag, Building2, Mic2, CreditCard
} from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import { getPaymentModeColor } from '../../../../utils/tableUtils';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';

const ExpenseList = ({
  expenses,
  isLoading,
  isDeleting,
  pagination,
  filters,
  onEdit,
  onDelete,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onLimitChange,
  hasPermission,
  gaushalaPagination,
  kathaPagination
}) => {
  const tableHeaders = [
    { label: 'Date' },
    { label: 'Category' },
    { label: 'Amount', className: 'text-right' },
    { label: 'Gaushala/Katha' },
    { label: 'Payment Mode', className: 'text-center' },
    { label: 'Description' },
    { label: 'Actions' }
  ];
  
  const filterFields = [
    { name: 'category', label: 'Category', placeholder: 'Search category...' },
    {
      name: 'gaushalaId',
      label: 'Gaushala',
      type: 'select',
      icon: Building2,
      options: gaushalaPagination.items.map(g => ({ value: g.id, label: g.name })),
      isServerSearch: true,
      onSearchChange: gaushalaPagination.handleSearch,
      onLoadMore: gaushalaPagination.handleLoadMore,
      hasMore: gaushalaPagination.hasMore,
      loading: gaushalaPagination.loading
    },
    {
      name: 'kathaId',
      label: 'Katha',
      type: 'select',
      icon: Mic2,
      options: kathaPagination.items.map(k => ({ value: k.id, label: k.name })),
      isServerSearch: true,
      onSearchChange: kathaPagination.handleSearch,
      onLoadMore: kathaPagination.handleLoadMore,
      hasMore: kathaPagination.hasMore,
      loading: kathaPagination.loading
    },
    { name: 'startDate', label: 'From Date', type: 'date', icon: Calendar },
    { name: 'endDate', label: 'To Date', type: 'date', icon: Calendar },
    { name: 'minAmount', label: 'Min Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 0' },
    { name: 'maxAmount', label: 'Max Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 10000+' },
    {
      name: 'paymentMode',
      label: 'Payment Mode',
      type: 'select',
      icon: CreditCard,
      options: [
        { value: 'cash', label: 'Cash' },
        { value: 'bank', label: 'Bank' },
        { value: 'online', label: 'Online' }
      ]
    }
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
            <td className="p-4 px-6 text-blue-600 font-bold text-right">
              <div className="flex items-center justify-end gap-0.5">
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
              <span className={`text-xs font-bold uppercase ${getPaymentModeColor(expense.paymentMode)}`}>
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

      <Pagination
         pagination={pagination}
         filters={filters}
         onPageChange={onPageChange}
         onLimitChange={onLimitChange}
       />
    </div>
  );
};

export default ExpenseList;
