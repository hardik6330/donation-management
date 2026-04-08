import React, { useState } from 'react';
import { useGetDonorsQuery } from '../../../services/apiSlice';
import { Search, ChevronDown, Filter } from 'lucide-react';
import AdminPageHeader from '../../../components/common/AdminPageHeader';
import AdminTable from '../../../components/common/AdminTable';

const DonorsList = () => {
  const [filters, setFilters] = useState({
    name: '',
    mobileNumber: '',
    city: ''
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const { data: donorsData, isLoading } = useGetDonorsQuery(filters);

  const donors = donorsData?.data || [];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: '', mobileNumber: '', city: '' });
  };

  const tableHeaders = [
    { label: 'Donor Info' },
    { label: 'Location' },
    { label: 'Donations', className: 'text-center' },
    { label: 'Total Amount', className: 'text-right' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Donors Management" 
        subtitle="Manage and track your unique donor database"
      />

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex sm:hidden items-center justify-between w-full py-1 text-xs font-bold text-gray-500 uppercase tracking-wider"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filters</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMobileFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className="hidden sm:flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50 pb-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>

        <div className={`${showMobileFilters ? 'block' : 'hidden'} sm:block mt-4 sm:mt-0`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Search className="w-3 h-3" /> Donor Name
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
                Mobile Number
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
                City / Village
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
      </div>

      <AdminTable 
        headers={tableHeaders} 
        isLoading={isLoading}
        emptyMessage="No donors found."
      >
        {donors.map((donor) => (
          <tr key={donor.mobileNumber} className="hover:bg-gray-50 transition">
            <td className="p-4 px-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-bold text-gray-800">{donor.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    {donor.mobileNumber}
                  </div>
                </div>
              </div>
            </td>
            <td className="p-4 px-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {donor.village || '-'}, {donor.district || '-'}
              </div>
              {donor.companyName && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  {donor.companyName}
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
      </AdminTable>
    </div>
  );
};

export default DonorsList;
