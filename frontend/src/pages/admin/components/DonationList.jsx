import React, { useState } from 'react';
import { useGetAllDonationsQuery, useGetCategoriesQuery, useUpdateDonationMutation } from '../../../services/apiSlice';
import { Search, Calendar, Loader2, IndianRupee, Tag, Edit, X } from 'lucide-react';
import { toast } from 'react-toastify';

const DonationList = () => {
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    amount: '',
    categoryId: '',
    page: 1,
    limit: 10,
    fetchAll: false,
    fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate'
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
      amount: '', 
      categoryId: '',
      page: 1, 
      limit: 10, 
      fetchAll: false, 
      fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate' 
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Donation Records</h1>
          <p className="text-sm text-gray-500 font-medium">View and filter all your donation transactions</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
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

          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <IndianRupee className="w-3 h-3" /> Amount
            </label>
            <input
              type="number"
              name="amount"
              placeholder="Min Amount"
              value={filters.amount}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">Donation Records</h2>
          {loading && <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px] sm:min-w-0">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[10px] sm:text-xs uppercase">
                <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Donor Name</th>
                <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Cause / Purpose</th>
                <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Village / District</th>
                <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Mode</th>
                <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Amount</th>
                <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Status</th>
                <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Payment Date</th>
                <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(donations) && donations.map((donation) => (
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
                  <td className="p-3 sm:p-4 px-4 sm:px-6">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      donation.paymentMode === 'cash' ? 'bg-orange-100 text-orange-700' : 
                      donation.paymentMode === 'pay_later' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {donation.paymentMode?.replace('_', ' ') || 'online'}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 px-4 sm:px-6 font-bold text-gray-800 text-sm">₹{donation.amount}</td>
                  <td className="p-3 sm:p-4 px-4 sm:px-6">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] font-semibold ${
                      donation.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      donation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
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
            </tbody>
          </table>
          {(!donations || donations.length === 0) && !loading && (
            <div className="p-8 text-center text-gray-500 text-sm">No donations found with current filters.</div>
          )}
        </div>

        {/* Pagination UI */}
        {pagination.totalPages > 1 && (
          <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4">
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
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Update Donation</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-200 text-gray-500 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-4 sm:p-6 space-y-4">
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

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationList;
