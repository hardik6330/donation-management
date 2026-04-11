import React from 'react';
import { Edit, Trash2, Search, IndianRupee } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';

const CategoryList = ({ 
  categories, 
  isLoading, 
  isUpdating, 
  isDeleting, 
  pagination,
  filters,
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onFilterChange,
  onClearFilters,
  onPageChange,
  onLimitChange,
  hasPermission 
}) => {
  const tableHeaders = [
    { label: 'Category Name' },
    { label: 'Description' },
    { label: 'Total Donation', className: 'text-right' },
    { label: 'Status', className: 'text-center' },
    { label: 'Actions' },
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Search by name...' },
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
        emptyMessage="No categories found."
      >
        {categories.map((cat) => (
          <tr key={cat.id} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6 font-bold text-gray-800">{cat.name}</td>
            <td className="p-4 px-6 text-sm text-gray-500">{cat.description || '-'}</td>
            <td className="p-4 px-6 text-right">
              <div className="inline-flex items-center justify-end gap-0.5 text-sm font-bold text-blue-700">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(cat.totalDonation || 0).toLocaleString('en-IN')}
              </div>
            </td>
            <td className="p-4 px-6 flex justify-center items-center">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={cat.isActive}
                  onChange={() => onToggleStatus(cat.id, cat.isActive)}
                  disabled={isUpdating || !hasPermission('category', 'entry')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className={`ms-3 text-[10px] font-bold uppercase transition ${cat.isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2">
                {hasPermission('category', 'entry') && (
                  <button
                    onClick={() => onEdit(cat)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('category', 'full') && (
                  <button
                    onClick={() => onDelete(cat.id)}
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

export default CategoryList;
