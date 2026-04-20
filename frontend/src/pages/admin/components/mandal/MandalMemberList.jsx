import { useState } from 'react';
import {
  useGetMandalMembersQuery,
  useDeleteMandalMemberMutation,
  useUpdateMandalMemberMutation,
  useGetMandalsQuery
} from '../../../../services/mandalApi';
import { useLazyGetCitiesQuery } from '../../../../services/masterApi';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { useTable } from '../../../../hooks/useTable';
import {
  Search, Edit, Trash2, CheckCircle, XCircle, UsersRound, IndianRupee
} from 'lucide-react';
import { getActiveHoverColor, getActiveLabel } from '../../../../utils/tableUtils';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';
import AddMemberModal from './AddMemberModal';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';

const MandalMemberList = () => {
  const {
    filters,
    handleFilterChange,
    handlePageChange,
    handleLimitChange,
    clearFilters,
  } = useTable({
    initialFilters: {
      search: '',
      mandalId: '',
      isActive: '',
      page: 1,
      limit: 10,
      fetchAll: false
    }
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  const { data: membersData, isLoading } = useGetMandalMembersQuery(filters);
  const { data: mandalsData } = useGetMandalsQuery({ fetchAll: 'true' });
  const [deleteMember, { isLoading: isDeleting }] = useDeleteMandalMemberMutation();
  const [updateMember] = useUpdateMandalMemberMutation();

  const [triggerGetCities] = useLazyGetCitiesQuery();
  const cityPagination = useDropdownPagination(triggerGetCities, {
    limit: 20
  });

  const members = membersData?.data?.items || [];
  const pagination = {
    currentPage: membersData?.data?.currentPage || 1,
    totalPages: membersData?.data?.totalPages || 1,
    totalData: membersData?.data?.totalData || 0,
    limit: membersData?.data?.limit || 10
  };

  const mandals = mandalsData?.data?.items || [];
  const mandalOptions = mandals.map(m => ({ value: m.id, label: m.name }));

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMember(deletingId).unwrap();
      toast.success('Member deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete member');
    }
  };

  const toggleStatus = async (member) => {
    try {
      await updateMember({ id: member.id, isActive: !member.isActive }).unwrap();
      toast.success(`Member ${member.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update');
    }
  };

  const tableHeaders = [
    { label: 'Name' },
    { label: 'Mobile' },
    { label: 'Mandal' },
    { label: 'Location' },
    { label: 'Status' },
    { label: 'Actions' }
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Name or Mobile...' },
    { name: 'mandalId', label: 'Mandal', type: 'select', icon: UsersRound, options: mandalOptions, placeholder: 'All Mandals' },
    { name: 'city', label: 'City', icon: Search, placeholder: 'Enter City...' },
    { name: 'isActive', label: 'Status', type: 'select', icon: CheckCircle, options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mandal Members"
        subtitle="Manage members across all mandals"
        buttonText="Add Member"
        onButtonClick={() => { setEditingMember(null); setIsAddModalOpen(true); }}
      />

      <div className="flex flex-wrap gap-3">
        <NavLink to="/admin/mandal" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-semibold rounded-xl hover:bg-purple-100 transition text-sm border border-purple-100">
          <UsersRound className="w-4 h-4" /> Mandals
        </NavLink>
        <NavLink to="/admin/mandal-payments" className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition text-sm border border-green-100">
          <IndianRupee className="w-4 h-4" /> Monthly Collections
        </NavLink>
      </div>

      <FilterSection filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} fields={filterFields} />

      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No members found.">
        {members.map((member) => (
          <tr key={member.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{member.name}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{member.mobileNumber}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{member.mandal?.name || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{member.city || '-'}</td>
            <td className="px-6 py-4">
              <button onClick={() => toggleStatus(member)} className={`flex items-center gap-1.5 text-xs font-bold transition-all ${getActiveHoverColor(member.isActive)}`}>
                {member.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {getActiveLabel(member.isActive)}
              </button>
            </td>
            <td className="px-6 py-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingMember(member); setIsAddModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(member.id)} disabled={isDeleting} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Pagination
        pagination={pagination}
        filters={filters}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editingData={editingMember}
        mandals={mandals}
        cityPagination={cityPagination}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
      />
    </div>
  );
};

export default MandalMemberList;
