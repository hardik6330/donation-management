import { useState } from 'react';
import { 
  useGetAllDonationsQuery, 
  useUpdateDonationMutation,
  useGetCitiesQuery,
  useGetSubLocationsQuery,
  useGetGaushalasQuery,
  useGetKathasQuery,
  useGetCategoriesQuery
} from '../../../../services/apiSlice';
import { Search, Calendar, Loader2, IndianRupee, Edit, X, FileDown, MapPin, MapPinHouse, Building2, Mic2, Tag, Filter, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import AdminModal from '../../../../components/common/AdminModal';
import FilterSection from '../../../../components/common/FilterSection';
import AddDonationModal from './AddDonationModal';

const DonationList = () => {
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    categoryId: '',
    cityId: '',
    talukaId: '',
    villageId: '',
    gaushalaId: '',
    kathaId: '',
    page: 1,
    limit: 10,
    fetchAll: false,
    fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,slipUrl'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    paymentMode: '',
    paymentDate: '',
    status: ''
  });

  const { data: donationsData, isLoading: loading } = useGetAllDonationsQuery(filters);
  const { data: categoriesData } = useGetCategoriesQuery();
  const [updateDonation, { isLoading: isUpdating }] = useUpdateDonationMutation();

  // Location Data for Filters
  const { data: filterCitiesData } = useGetCitiesQuery();
  const { data: filterTalukasData } = useGetSubLocationsQuery(filters.cityId, { skip: !filters.cityId });
  const { data: filterVillagesData } = useGetSubLocationsQuery(filters.talukaId, { skip: !filters.talukaId });

  // Filter Gaushalas and Kathas based on location filters
  const filterLocationId = filters.villageId || filters.talukaId || filters.cityId;
  const { data: filterGaushalasData } = useGetGaushalasQuery({ locationId: filterLocationId, fetchAll: 'true' }, { skip: !filterLocationId });
  const { data: filterKathasData } = useGetKathasQuery({ locationId: filterLocationId, fetchAll: 'true' }, { skip: !filterLocationId });

  const filterCities = filterCitiesData?.data || [];
  const filterTalukas = filterTalukasData?.data || [];
  const filterVillages = filterVillagesData?.data || [];
  const filterGaushalas = filterGaushalasData?.data?.rows || [];
  const filterKathas = filterKathasData?.data?.rows || [];
  const categories = categoriesData?.data || [];

  const donations = donationsData?.data?.donations || [];
  const pagination = {
    currentPage: donationsData?.data?.currentPage || 1,
    totalPages: donationsData?.data?.totalPages || 1,
    totalData: donationsData?.data?.totalData || 0,
    limit: donationsData?.data?.limit || 10
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'cityId') {
      setFilters(prev => ({ ...prev, cityId: value, talukaId: '', villageId: '', gaushalaId: '', kathaId: '', page: 1 }));
      return;
    }
    if (name === 'talukaId') {
      setFilters(prev => ({ ...prev, talukaId: value, villageId: '', gaushalaId: '', kathaId: '', page: 1 }));
      return;
    }
    if (name === 'villageId') {
      setFilters(prev => ({ ...prev, villageId: value, gaushalaId: '', kathaId: '', page: 1 }));
      return;
    }

    setFilters(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({ 
      search: '', 
      startDate: '', 
      endDate: '', 
      minAmount: '', 
      maxAmount: '',
      categoryId: '',
      cityId: '',
      talukaId: '',
      villageId: '',
      gaushalaId: '',
      kathaId: '',
      page: 1, 
      limit: 10, 
      fetchAll: false, 
      fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,slipUrl' 
    });
  };

  const handleEditClick = (donation) => {
    setEditingDonation(donation);
    setEditForm({
      amount: donation.amount,
      paymentMode: donation.paymentMode,
      paymentDate: donation.paymentDate ? new Date(donation.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: donation.status
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDonation({
        id: editingDonation.id,
        ...editForm,
        paymentDate: editForm.status === 'completed' && !editForm.paymentDate ? new Date() : editForm.paymentDate
      }).unwrap();
      toast.success('Donation updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update donation');
    }
  };

  const tableHeaders = [
    { label: 'Donor Name' },
    { label: 'Cause / Purpose' },
    { label: 'Gaushala / Katha' },
    { label: 'Village / District' },
    { label: 'Reference' },
    { label: 'Mode' },
    { label: 'Amount' },
    { label: 'Status' },
    { label: 'Payment Date' },
    { label: 'Actions' },
  ];

  const filterFields = [
    { name: 'search', label: 'Search Donor', icon: Search, placeholder: 'Name, Email or Mobile...' },
    { 
      name: 'cityId', 
      label: 'City', 
      type: 'select', 
      icon: MapPin,
      options: filterCities.map(c => ({ value: c.id, label: c.name }))
    },
    { 
      name: 'talukaId', 
      label: 'Taluka', 
      type: 'select', 
      icon: MapPinHouse,
      disabled: !filters.cityId,
      options: filterTalukas.map(t => ({ value: t.id, label: t.name }))
    },
    { 
      name: 'villageId', 
      label: 'Village', 
      type: 'select', 
      icon: Building2,
      disabled: !filters.talukaId,
      options: filterVillages.map(v => ({ value: v.id, label: v.name }))
    },
    { 
      name: 'gaushalaId', 
      label: 'Gaushala', 
      type: 'select', 
      icon: Building2,
      options: filterGaushalas.map(g => ({ value: g.id, label: g.name }))
    },
    { 
      name: 'kathaId', 
      label: 'Katha', 
      type: 'select', 
      icon: Mic2,
      options: filterKathas.map(k => ({ value: k.id, label: k.name }))
    },
    { 
      name: 'categoryId', 
      label: 'Category', 
      type: 'select', 
      icon: Tag,
      options: categories.map(cat => ({ value: cat.id, label: cat.name }))
    },
    { name: 'startDate', label: 'From Date', type: 'date', icon: Calendar },
    { name: 'endDate', label: 'To Date', type: 'date', icon: Calendar },
    { name: 'minAmount', label: 'Min Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 0' },
    { name: 'maxAmount', label: 'Max Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 10000+' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Donation Records" 
        subtitle="View and filter all your donation transactions"
        buttonText="Add Donation"
        onButtonClick={() => setIsAddModalOpen(true)}
      />

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        fields={filterFields}
      />

      <AdminTable 
        headers={tableHeaders} 
        isLoading={loading}
        emptyMessage="No donations found with current filters."
      >
        {donations.map((donation) => (
          <tr key={donation.id} className="hover:bg-gray-50 transition">
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <div className="font-medium text-gray-800 text-sm">{donation.donor?.name}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{donation.donor?.email}</div>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <div className="text-gray-800 text-sm font-medium line-clamp-2 max-w-[200px]" title={donation.cause}>
                {donation.cause || 'General Donation'}
              </div>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              {donation.gaushala?.name ? (
                <div className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase">
                  Gaushala: {donation.gaushala.name}
                </div>
              ) : donation.katha?.name ? (
                <div className="text-[10px] sm:text-xs font-bold text-orange-600 uppercase">
                  Katha: {donation.katha.name}
                </div>
              ) : (
                <span className="text-gray-400 text-xs">-</span>
              )}
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6 text-gray-600 text-[10px] sm:text-sm">
              {donation.donor?.village || '-'} / {donation.donor?.district || '-'}
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6 text-gray-600 text-[10px] sm:text-sm italic">
              {donation.referenceName || '-'}
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <span className={`text-[10px] font-bold uppercase ${
                donation.paymentMode === 'cash' ? 'text-orange-600' : 
                donation.paymentMode === 'pay_later' ? 'text-purple-600' : 'text-blue-600'
              }`}>
                {donation.paymentMode?.replace('_', ' ') || 'online'}
              </span>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6 font-bold text-gray-800 text-sm">₹{donation.amount}</td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <span className={`text-[10px] font-bold uppercase ${
                donation.status === 'completed' ? 'text-green-600' : 
                donation.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {donation.status}
              </span>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6 text-gray-500 text-[10px] sm:text-sm whitespace-nowrap">
              {donation.paymentDate ? new Date(donation.paymentDate).toLocaleDateString() : '-'}
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <div className="flex items-center gap-1">
                {donation.slipUrl && (
                  <a
                    href={donation.slipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition inline-flex"
                    title="Download Slip"
                  >
                    <FileDown className="w-4 h-4" />
                  </a>
                )}
                {donation.paymentMode === 'pay_later' && donation.status !== 'completed' && (
                  <button
                    onClick={() => handleEditClick(donation)}
                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                    title="Edit Donation"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Pagination UI */}
      {pagination.totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Showing <span className="font-bold">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span> records
          </p>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pagination.totalPages > 5 && (pageNum < pagination.currentPage - 1 || pageNum > pagination.currentPage + 1) && pageNum !== 1 && pageNum !== pagination.totalPages) {
                  if (pageNum === pagination.currentPage - 2 || pageNum === pagination.currentPage + 2) {
                    return <span key={pageNum} className="text-gray-400">...</span>;
                  }
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-bold transition ${
                      pagination.currentPage === pageNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Donation"
        icon={<Edit />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <IndianRupee className="w-3 h-3" /> Amount
              </label>
              <input
                type="number"
                required
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                Payment Mode
              </label>
              <select
                required
                value={editForm.paymentMode}
                onChange={(e) => setEditForm(prev => ({ ...prev, paymentMode: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="online">Online</option>
                <option value="cash">Cash</option>
                <option value="pay_later">Pay Later</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Payment Date
              </label>
              <input
                type="date"
                required
                value={editForm.paymentDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                Status
              </label>
              <select
                required
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-blue-200"
            >
              {isUpdating ? <Loader2 className="animate-spin mx-auto" /> : 'Update Donation'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Add Donation Modal */}
      <AddDonationModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

export default DonationList;
