import React, { useState } from 'react';
import { useGetAdminStatsQuery, useGetAllDonationsQuery } from '../../services/apiSlice';
import { Users, IndianRupee, CreditCard, LogOut, ArrowLeft, Search, Calendar, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    amount: '',
    page: 1,
    limit: 10,
    fetchAll: false,
    fields: 'id,amount,cause,status,createdAt'
  });

  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: response, isLoading: donationsLoading } = useGetAllDonationsQuery(filters);
  const donations = response?.data?.donations || [];
  const pagination = {
    totalData: response?.data?.totalData || 0,
    totalPages: response?.data?.totalPages || 0,
    currentPage: response?.data?.currentPage || 1,
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFilters((prev) => ({ ...prev, [name]: val, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
     setFilters({ search: '', startDate: '', endDate: '', amount: '', page: 1, limit: 10, fetchAll: false, fields: 'id,amount,cause,status,createdAt' });
   };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar / Header */}
      <nav className="bg-white shadow-md p-3 sm:p-4 flex justify-between items-center px-4 sm:px-8 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate max-w-[150px] sm:max-w-none">Admin Dashboard</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1 sm:gap-2 text-red-600 font-semibold hover:bg-red-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition text-sm sm:text-base"
        >
          <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>

      <main className="p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-2.5 sm:p-3 rounded-xl">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Donors</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.data?.totalUsers}</h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-2.5 sm:p-3 rounded-xl">
              <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Amount</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">₹{stats?.data?.totalDonationAmount?.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-100 p-2.5 sm:p-3 rounded-xl">
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Donation Count</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.data?.totalDonationCount}</h3>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-yellow-100 flex items-center gap-4">
            <div className="bg-yellow-100 p-2.5 sm:p-3 rounded-xl">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-yellow-700 font-bold uppercase tracking-wider">Top Donor</p>
              {stats?.data?.topDonor ? (
                <>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate max-w-[120px] sm:max-w-[150px]">{stats?.data?.topDonor.name}</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-orange-600">₹{stats?.data?.topDonor.amount?.toLocaleString()}</p>
                </>
              ) : (
                <h3 className="text-base sm:text-lg font-bold text-gray-400">N/A</h3>
              )}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Search className="w-3 h-3" /> Search Donor
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Name or Email"
                className="w-full px-3 sm:px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Calendar className="w-3 h-3" /> From Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 sm:px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Calendar className="w-3 h-3" /> To Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 sm:px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <IndianRupee className="w-3 h-3" /> Amount
              </label>
              <input
                type="number"
                name="amount"
                value={filters.amount}
                onChange={handleFilterChange}
                placeholder="Exact Amount ₹"
                className="w-full px-3 sm:px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

        {/* Recent Donations Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">Donation Records</h2>
            {donationsLoading && <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px] sm:min-w-0">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[10px] sm:text-xs uppercase">
                  <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Donor Name</th>
                  <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Village / District</th>
                  <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Cause</th>
                  <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Amount</th>
                  <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Status</th>
                  <th className="p-3 sm:p-4 px-4 sm:px-6 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations?.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 sm:p-4 px-4 sm:px-6">
                      <div className="font-medium text-gray-800 text-sm">{donation.donor?.name}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{donation.donor?.email}</div>
                    </td>
                    <td className="p-3 sm:p-4 px-4 sm:px-6 text-gray-600 text-[10px] sm:text-sm">
                      {donation.donor?.village || '-'} / {donation.donor?.district || '-'}
                    </td>
                    <td className="p-3 sm:p-4 px-4 sm:px-6 text-gray-600 text-[10px] sm:text-sm truncate max-w-[100px] sm:max-w-none">{donation.cause}</td>
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
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!donations || donations.length === 0) && (
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
                  {/* Show limited page numbers on mobile */}
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Logic to show only few pages around current page on mobile
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
      </main>
    </div>
  );
};

export default AdminDashboard;
