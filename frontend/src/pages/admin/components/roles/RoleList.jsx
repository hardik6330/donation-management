import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';

const RoleList = ({ roles, modules, permColors, parsePerms, isLoading, isDeleting, onEdit, onDelete, hasPermission }) => {
  const tableHeaders = [
    { label: 'Role Name' },
    { label: 'Description' },
    { label: 'Permissions' },
    { label: 'Actions' }
  ];

  return (
    <div className="space-y-6">
      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No roles found.">
        {roles.map((role) => (
          <tr key={role.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-bold text-gray-900">{role.name}</td>
            <td className="px-6 py-4 text-sm text-gray-600">{role.description || '-'}</td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-1.5">
                {modules.slice(0, 5).map(m => {
                  const perms = parsePerms(role.permissions);
                  const perm = perms?.[m.key] || 'none';
                  if (perm === 'none') return null;
                  return (
                    <span key={m.key} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${permColors[perm]}`}>
                      {m.label}: {perm}
                    </span>
                  );
                })}
                {modules.length > 5 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-gray-400">
                    +{modules.length - 5} more
                  </span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                {hasPermission('users', 'entry') && (
                  <button onClick={() => onEdit(role)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('users', 'full') && (
                  <button onClick={() => onDelete(role.id)} disabled={isDeleting} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
};

export default RoleList;
