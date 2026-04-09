import React, { useState } from 'react';
import DonorsList from './DonorsList';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetDonorsQuery } from '../../../../services/apiSlice';

const Donors = () => {
  const [filters, setFilters] = useState({
    name: '',
    mobileNumber: '',
    city: '',
    minAmount: '',
    maxAmount: '',
    page: 1,
    limit: 10,
  });

  const { data: donorsData, isLoading: donorsLoading } = useGetDonorsQuery(filters);
  const donors = donorsData?.data?.donors || [];
  const pagination = {
    currentPage: donorsData?.data?.currentPage || 1,
    totalPages: donorsData?.data?.totalPages || 1,
    totalData: donorsData?.data?.totalData || 0,
    limit: donorsData?.data?.limit || 10,
  };  

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ name: '', mobileNumber: '', city: '', minAmount: '', maxAmount: '', page: 1, limit: 10 });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Donors Management"
        subtitle="Manage and track your unique donor database"
      />
      <DonorsList
        donors={donors}
        isLoading={donorsLoading}
        filters={filters}
        pagination={pagination}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Donors;
