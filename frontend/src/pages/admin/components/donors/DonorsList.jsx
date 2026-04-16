import React from 'react';
import { Search, Phone, MapPin, IndianRupee } from 'lucide-react';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';

const DonorsList = ({ 
  donors, 
  isLoading, 
  filters, 
  pagination, 
  onFilterChange, 
  onClearFilters, 
  onPageChange,
  onLimitChange 
}) => {
  const filterFields = [
    { name: 'name', label: 'Donor Name', icon: Search, placeholder: 'Search by name...' },
    { name: 'mobileNumber', label: 'Mobile Number', icon: Phone, placeholder: 'Search by mobile...' },
    { name: 'city', label: 'City', icon: MapPin, placeholder: 'Search by city...' },
    { name: 'state', label: 'State', icon: MapPin, placeholder: 'Search by state name...' },
    { name: 'minAmount', label: 'Min Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 0' },
    { name: 'maxAmount', label: 'Max Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 10000+' },
  ];

  const tableHeaders = [
    { label: 'Donor Info' },
    { label: 'Address' },
    { label: 'City' },
    { label: 'State' },
    { label: 'Company Name' },
    { label: 'Donations', className: 'text-center' },
    { label: 'Total Amount', className: 'text-right' },
  ];

  return (
    <div className="space-y-6">
      <FilterSection
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
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
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm text-gray-500 uppercase">{donor.address || '-'}</div>
                </div>
              </div>
            </td>
              <td className="p-4 px-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm text-gray-500 uppercase">{donor.city || '-'}</div>
                </div>
              </div>
            </td>
              <td className="p-4 px-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm text-gray-500 uppercase">{donor.state || '-'}</div>
                </div>
              </div>
            </td>
              <td className="p-4 px-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm text-gray-500 uppercase">{donor.companyName || '-'}</div>
                </div>
              </div>
            </td>
            <td className="p-2 px-3 text-center">
              <span className="bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                {donor.donationCount}
              </span>
            </td>
            <td className="p-4 px-6 text-right">
              <div className="inline-flex items-center justify-end gap-0.5 text-sm font-bold text-blue-700">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(donor.totalDonated || 0).toLocaleString('en-IN')}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Pagination
        pagination={pagination}
        filters={filters}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
};

export default DonorsList;
