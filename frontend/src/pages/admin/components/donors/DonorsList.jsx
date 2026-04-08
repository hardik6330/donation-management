import React, { useState } from 'react';
import { useGetDonorsQuery } from '../../../../services/apiSlice';
import { Search, Phone, MapPin } from 'lucide-react';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';

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

  const filterFields = [
    { name: 'name', label: 'Donor Name', icon: Search, placeholder: 'Search by name...' },
    { name: 'mobileNumber', label: 'Mobile Number', icon: Phone, placeholder: 'Search by mobile...' },
    { name: 'city', label: 'City / Village', icon: MapPin, placeholder: 'Search by city...' },
  ];

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

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        fields={filterFields}
      />

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
