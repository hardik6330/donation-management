import React, { useState } from 'react';
import { useGetDonorsQuery } from '../../../services/apiSlice';
import { Search, Phone, Mail, User, MapPin, Building, Loader2 } from 'lucide-react';

const DonorsList = () => {
  const [filters, setFilters] = useState({
    name: '',
    mobileNumber: '',
    city: ''
  });
  
  const { data: donorsData, isLoading } = useGetDonorsQuery(filters);

  const donors = donorsData?.data || [];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: '', mobileNumber: '', city: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Donors Management</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and track your unique donor database</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <User className="w-3 h-3" /> Donor Name
            </label>
            <input
              name="name"
              placeholder="Search by name..."
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Phone className="w-3 h-3" /> Mobile Number
            </label>
            <input
              name="mobileNumber"
              placeholder="Search by mobile..."
              value={filters.mobileNumber}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <MapPin className="w-3 h-3" /> City / Village
            </label>
            <input
              name="city"
              placeholder="Search by city..."
              value={filters.city}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg text-xs sm:text-sm transition h-[38px]"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px] sm:min-w-0">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                <th className="p-4 px-6 font-semibold">Donor Info</th>
                <th className="p-4 px-6 font-semibold">Location</th>
                <th className="p-4 px-6 font-semibold text-center">Donations</th>
                <th className="p-4 px-6 font-semibold text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : donors.map((donor) => (
                <tr key={donor.mobileNumber} className="hover:bg-gray-50 transition">
                  <td className="p-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{donor.name}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Phone className="w-3 h-3" /> {donor.mobileNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {donor.village || '-'}, {donor.district || '-'}
                    </div>
                    {donor.companyName && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Building className="w-3 h-3" /> {donor.companyName}
                      </div>
                    )}
                  </td>
                  <td className="p-4 px-6 text-center">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                      {donor.donationCount}
                    </span>
                  </td>
                  <td className="p-4 px-6 text-right font-bold text-blue-600">
                    ₹{donor.totalDonated?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && donors.length === 0 && (
            <div className="p-12 text-center text-gray-500">No donors found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorsList;
