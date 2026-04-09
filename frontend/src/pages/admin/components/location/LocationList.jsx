import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';

const LocationList = ({ cities, isLoading, isDeleting, onEdit, onDelete, hasPermission }) => {
  const tableHeaders = [
    { label: 'City Name' },
    { label: 'Type' },
    { label: 'Actions' },
  ];

  return (
    <AdminTable 
      headers={tableHeaders} 
      isLoading={isLoading}
      emptyMessage="No locations found."
    >
      {cities.map((city) => (
        <tr key={city.id} className="hover:bg-gray-50 transition">
          <td className="p-4 px-6 font-bold text-gray-800">{city.name}</td>
          <td className="p-4 px-6 text-sm text-gray-500 uppercase">{city.type}</td>
          <td className="p-4 px-6">
            <div className="flex items-center gap-2">
              {hasPermission('location', 'entry') && (
                <button
                  onClick={() => onEdit(city)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {hasPermission('location', 'full') && (
                <button
                  onClick={() => onDelete(city.id)}
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

export default LocationList;
