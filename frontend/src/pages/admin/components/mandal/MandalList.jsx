import React from 'react';
import { Search, Edit, Trash2, CheckCircle, XCircle, Receipt, Calendar } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import { getActiveHoverColor, getActiveLabel } from '../../../../utils/tableUtils';

const MandalList = ({
  mandals,
  isLoading,
  isDeleting,
  isGenerating,
  generatedMandals,
  pagination,
  filters,
  onEdit,
  onDelete,
  onToggleStatus,
  onGeneratePayments,
  onFilterChange,
  onClearFilters,
  onPageChange,
  hasPermission
}) => {
  const getDisplayMonth = (val) => {
    if (!val) return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const [y, m] = val.split('-');
    return new Date(y, parseInt(m) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const tableHeaders = [
    { label: 'Mandal Name' },
    { label: 'Price (₹)' },
    { label: 'Type' },
    { label: 'Members' },
    { label: 'Current Month' },
    { label: 'Status' },
    { label: 'Actions' }
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search mandal name...' },
    { name: 'month', label: 'Month', type: 'month', icon: Calendar },
    {
      name: 'isActive', label: 'Status', type: 'select', icon: CheckCircle,
      options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]
    }
  ];

  return (
    <div className="space-y-6">
      <FilterSection filters={filters} onFilterChange={onFilterChange} onClearFilters={onClearFilters} fields={filterFields} />

      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No mandals found.">
        {mandals.map((mandal) => (
          <tr key={mandal.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase">{mandal.name}</td>
            <td className="px-6 py-4 text-sm text-gray-700 font-bold">₹{mandal.price}</td>
            <td className="px-6 py-4 text-xs font-bold uppercase text-gray-500">{mandal.mandalType}</td>
            <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{mandal.memberCount || 0} Members</td>
            <td className="px-6 py-4 text-xs font-medium text-gray-500">{getDisplayMonth(filters.month)}</td>
            <td className="px-6 py-4">
              <button
                onClick={() => onToggleStatus(mandal)}
                disabled={!hasPermission('mandal', 'entry')}
                className={`flex items-center gap-1 text-xs font-bold uppercase transition ${getActiveHoverColor(mandal.isActive)}`}
              >
                {mandal.isActive ? <><CheckCircle className="w-3 h-3" /> {getActiveLabel(true)}</> : <><XCircle className="w-3 h-3" /> {getActiveLabel(false)}</>}
              </button>
            </td>
            <td className="px-6 py-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                {hasPermission('mandal', 'entry') && (
                  <button onClick={() => onEdit(mandal)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('mandal', 'entry') && mandal.isActive && (
                  <button
                    onClick={() => onGeneratePayments(mandal.id)}
                    disabled={isGenerating || generatedMandals?.has(mandal.id) || mandal.paymentGenerated}
                    className={`p-1.5 rounded-lg transition-colors ${
                      (generatedMandals?.has(mandal.id) || mandal.paymentGenerated)
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-purple-600 hover:bg-purple-50'
                    }`}
                    title={(generatedMandals?.has(mandal.id) || mandal.paymentGenerated) ? 'Payments already generated' : 'Generate Monthly Payment'}
                  >
                    <Receipt className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('mandal', 'full') && (
                  <button onClick={() => onDelete(mandal.id)} disabled={isDeleting} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
            Showing <span className="font-bold">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span> mandals
          </p>
          <div className="flex gap-2">
            <button
              disabled={filters.page === 1}
              onClick={() => onPageChange(filters.page - 1)}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={filters.page === pagination.totalPages}
              onClick={() => onPageChange(filters.page + 1)}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MandalList;
