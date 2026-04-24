import React, { useState } from 'react';
import {
  Calendar, IndianRupee, Edit, Trash2, Tag, Building2, Mic2, CreditCard, Activity, PlusCircle, Eye
} from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import { getPaymentModeColor, paymentModes, expenseStatuses } from '../../../../utils/tableUtils';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';
import ExpenseInstallmentTable from './ExpenseInstallmentTable';

const ExpenseList = ({
  expenses,
  isLoading,
  isDeleting,
  pagination,
  filters,
  onEdit,
  onDelete,
  onAddPayment,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onLimitChange,
  hasPermission,
  gaushalaPagination,
  kathaPagination,
  expenseCategoryPagination
}) => {
  const [expandedRowId, setExpandedRowId] = useState(null);
  const toggleExpand = (id) => setExpandedRowId(prev => (prev === id ? null : id));
  const expenseCategoryOptions = (expenseCategoryPagination?.items || []).map(c => ({
    value: c.name,
    label: c.name
  }));

  const tableHeaders = [
    { label: 'Date' },
    { label: 'Category' },
    { label: 'Amount', className: 'text-right' },
    { label: 'Gaushala/Katha' },
    { label: 'Payment Mode', className: 'text-center' },
    { label: 'Status', className: 'text-center' },
    { label: 'Description' },
    { label: 'Actions' }
  ];

  const statusBadge = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'pay_later') return 'bg-gray-200 text-gray-700';
    if (status === 'partially_paid') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-600';
  };
  const statusLabel = (status) => {
    if (status === 'completed') return 'Completed';
    if (status === 'pay_later') return 'Pay Later';
    if (status === 'partially_paid') return 'Partially Paid';
    return status || '-';
  };
  
  const filterFields = [
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      icon: Tag,
      options: expenseCategoryOptions
    },
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
      options: paymentModes.map(m => ({ value: m.id, label: m.name }))
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      icon: Activity,
      options: expenseStatuses.map(s => ({ value: s.id, label: s.name }))
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
          <React.Fragment key={expense.id}>
          <tr className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 text-sm text-gray-500">
              {new Date(expense.date).toLocaleDateString('en-IN')}
            </td>
            <td className="p-4 px-6 font-bold text-gray-800">{expense.category}</td>
            <td className="p-4 px-6 text-right">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-0.5 text-blue-600 font-bold text-lg">
                  <IndianRupee className="w-4 h-4" />
                  {Number(expense.amount).toLocaleString('en-IN')}
                </div>
                
                {(expense.status === 'partially_paid' || expense.status === 'pay_later') && (
                  <div className="flex flex-col items-end mt-0.5 leading-tight">
                    <div className="text-[11px] font-bold text-emerald-600">
                      Paid: ₹{Number(expense.paidAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] font-bold text-orange-600">
                      Rem: ₹{Number(expense.remainingAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
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
            <td className="p-4 px-6 text-center">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadge(expense.status)}`}>
                {statusLabel(expense.status)}
              </span>
            </td>
            <td className="p-4 px-6 text-sm text-gray-500 max-w-xs truncate">
              {expense.description || '-'}
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2">
                {(expense.status === 'partially_paid' || expense.status === 'completed') && (
                  <button
                    onClick={() => toggleExpand(expense.id)}
                    className={`p-1.5 rounded-lg transition-colors ${expandedRowId === expense.id ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-100'}`}
                    title="View History"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('expenses', 'entry') && expense.status === 'partially_paid' && (
                  <button
                    onClick={() => onAddPayment?.(expense)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Add Partial Payment"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                )}
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
          {expandedRowId === expense.id && (
            <tr className="bg-gray-50/30">
              <td colSpan={tableHeaders.length} className="p-6 pt-0">
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <ExpenseInstallmentTable expenseId={expense.id} />
                </div>
              </td>
            </tr>
          )}
          </React.Fragment>
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
