import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';

const CategoryList = ({ categories, isLoading, isUpdating, isDeleting, onEdit, onDelete, onToggleStatus, hasPermission }) => {
  const tableHeaders = [
    { label: 'Category Name' },
    { label: 'Description' },
    { label: 'Total Donation', className: 'text-center' },
    { label: 'Status', className: 'text-center' },
    { label: 'Actions' },
  ];

  return (
    <AdminTable 
      headers={tableHeaders} 
      isLoading={isLoading}
      emptyMessage="No categories found."
    >
      {categories.map((cat) => (
        <tr key={cat.id} className="hover:bg-gray-50 transition">
          <td className="p-4 px-6 font-bold text-gray-800">{cat.name}</td>
          <td className="p-4 px-6 text-sm text-gray-500">{cat.description || '-'}</td>
          <td className="p-4 px-6 text-center font-bold text-blue-600">
            ₹{Number(cat.totalDonation || 0).toLocaleString('en-IN')}
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
  );
};

export default CategoryList;
