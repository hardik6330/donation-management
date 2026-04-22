import React from 'react';
import {
  Calendar, IndianRupee, Edit, Trash2, Tag, Building2, Mic2, FileText
} from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';

const IncomeList = ({
  income,
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
  hasPermission
}) => {
  const tableHeaders = [
    { label: 'Date' },
    { label: 'Title' },
    { label: 'Amount', className: 'text-right' },
    { label: 'Note' },
    { label: 'Actions' }
  ];
  
  const filterFields = [
    { name: 'startDate', label: 'From Date', type: 'date', icon: Calendar },
    { name: 'endDate', label: 'To Date', type: 'date', icon: Calendar },
    { name: 'minAmount', label: 'Min Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 0' },
    { name: 'maxAmount', label: 'Max Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 10000+' },
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
        emptyMessage="No income records found."
      >
        {income.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 text-sm text-gray-500">
              {new Date(item.date).toLocaleDateString('en-IN')}
            </td>
            <td className="p-4 px-6 font-bold text-gray-800">{item.title}</td>
            <td className="p-4 px-6 text-green-600 font-bold text-right">
              <div className="flex items-center justify-end gap-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(item.amount).toLocaleString('en-IN')}
              </div>
            </td>
            <td className="p-4 px-6 text-sm text-gray-500 max-w-xs truncate">
              {item.note || '-'}
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2">
                {hasPermission('income', 'entry') && (
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('income', 'full') && (
                  <button
                    onClick={() => onDelete(item.id)}
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

export default IncomeList;
