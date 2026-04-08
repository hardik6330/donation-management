import { useState } from 'react';
import { 
  useGetSevaksQuery, 
  useDeleteSevakMutation,
  useUpdateSevakMutation
} from '../../../../services/apiSlice';
import { 
  Search, Loader2, Edit, Trash2, Filter, Plus, User, Phone, MapPin, Landmark, CheckCircle, XCircle, ChevronDown, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import AddSevakModal from './AddSevakModal';

const SevakList = () => {
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    state: '',
    isActive: '',
    page: 1,
    limit: 10
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSevak, setEditingSevak] = useState(null);

  const { data: sevaksData, isLoading: loading } = useGetSevaksQuery(filters);
  const [deleteSevak, { isLoading: isDeleting }] = useDeleteSevakMutation();
  const [updateSevak] = useUpdateSevakMutation();

  const sevaks = sevaksData?.data?.rows || [];
  const pagination = {
    currentPage: sevaksData?.data?.currentPage || 1,
    totalPages: sevaksData?.data?.totalPages || 1,
    totalData: sevaksData?.data?.totalData || 0,
    limit: sevaksData?.data?.limit || 10
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      state: '',
      isActive: '',
      page: 1,
      limit: 10
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sevak?')) {
      try {
        await deleteSevak(id).unwrap();
        toast.success('Sevak deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete sevak');
      }
    }
  };

  const handleEdit = (sevak) => {
    setEditingSevak(sevak);
    setIsAddModalOpen(true);
  };

  const toggleStatus = async (sevak) => {
    try {
      await updateSevak({ id: sevak.id, isActive: !sevak.isActive }).unwrap();
      toast.success(`Sevak ${sevak.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  const tableHeaders = [
    { label: 'Name' },
    { label: 'Mobile' },
    { label: 'City' },
    { label: 'State' },
    { label: 'Status' },
    { label: 'Actions' }
  ];

  const filterFields = [
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Name or Mobile...' },
    { name: 'city', label: 'City', icon: Landmark, placeholder: 'Filter by city...' },
    { name: 'state', label: 'State', icon: MapPin, placeholder: 'Filter by state...' },
    { 
      name: 'isActive', 
      label: 'Status', 
      type: 'select', 
      icon: CheckCircle,
      options: [
        { value: 'true', label: 'Active Only' },
        { value: 'false', label: 'Inactive Only' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Sevak Management" 
        subtitle="Manage and track all organizational sevaks"
        buttonText="Add Sevak"
        onButtonClick={() => {
          setEditingSevak(null);
          setIsAddModalOpen(true);
        }}
      />

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        fields={filterFields}
      />

      {/* Table */}
      <AdminTable
        headers={tableHeaders}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
      >
        {sevaks.map((sevak) => (
          <tr key={sevak.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-semibold text-gray-900">{sevak.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {sevak.mobileNumber}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {sevak.city || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {sevak.state || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button 
                onClick={() => toggleStatus(sevak)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  sevak.isActive 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {sevak.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {sevak.isActive ? 'Active' : 'Inactive'}
              </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(sevak)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(sevak.id)}
                  disabled={isDeleting}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {sevaks.length === 0 && !loading && (
          <tr>
            <td colSpan={tableHeaders.length} className="px-6 py-12 text-center text-gray-500">
              No sevaks found matching your search.
            </td>
          </tr>
        )}
      </AdminTable>

      <AddSevakModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editingSevak={editingSevak}
      />
    </div>
  );
};

export default SevakList;
