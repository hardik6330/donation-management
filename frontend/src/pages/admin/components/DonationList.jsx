import React, { useState } from 'react';
import { useGetAllDonationsQuery, useGetCategoriesQuery, useUpdateDonationMutation } from '../../../services/apiSlice';
import { Search, Calendar, Loader2, IndianRupee, Tag, Edit, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../components/common/AdminPageHeader';
import AdminTable from '../../../components/common/AdminTable';
import AdminModal from '../../../components/common/AdminModal';

const DonationList = () => {
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    categoryId: '',
    page: 1,
    limit: 10,
    fetchAll: false,
    fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const donations = donationsData?.data?.donations || [];
  const categories = categoriesData?.data || [];
  const pagination = {
    currentPage: donationsData?.data?.currentPage || 1,
    totalPages: donationsData?.data?.totalPages || 1,
    totalData: donationsData?.data?.totalData || 0,
    limit: donationsData?.data?.limit || 10
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value,
      page: 1 // Reset to first page on filter change
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
      page: 1, 
      limit: 10, 
      fetchAll: false, 
      fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName' 
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
        // If they changed status to completed, ensure paymentDate is set
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
    { label: 'Village / District' },
    { label: 'Reference' },
    { label: 'Mode' },
    { label: 'Amount' },
    { label: 'Status' },
    { label: 'Payment Date' },
    { label: 'Action' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Donation Records" 
        subtitle="View and filter all your donation transactions"
      />

      {/* Filters Section */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Search className="w-3 h-3" /> Search Donor
            </label>
            <input
              name="search"
              placeholder="Name, Email or Mobile..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <IndianRupee className="w-3 h-3" /> Amount Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minAmount"
                placeholder="Min"
                value={filters.minAmount}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="number"
                name="maxAmount"
                placeholder="Max"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Tag className="w-3 h-3" /> Category
            </label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Calendar className="w-3 h-3" /> End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-row sm:flex-col lg:flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="checkbox"
                name="fetchAll"
                id="fetchAll"
                checked={filters.fetchAll}
                onChange={handleFilterChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="fetchAll" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase cursor-pointer whitespace-nowrap">
                Fetch All
              </label>
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg text-xs sm:text-sm transition whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

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
              {donation.paymentMode === 'pay_later' && (
                <button
                  onClick={() => handleEditClick(donation)}
                  className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                  title="Edit Donation"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Pagination UI */}
      {pagination.totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4 rounded-2xl shadow-sm border border-gray-100">
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
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
            >
              {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Update Donation
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default DonationList;
