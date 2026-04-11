import React, { useState } from 'react';
import DonorsList from './DonorsList';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetDonorsQuery
} from '../../../../services/donationApi';
import {
  useLazyGetCitiesQuery, 
  useLazyGetSubLocationsQuery 
} from '../../../../services/masterApi';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';

const Donors = () => {
  const [filters, setFilters] = useState({
    name: '',
    mobileNumber: '',
    cityId: '',
    talukaId: '',
    villageId: '',
    minAmount: '',
    maxAmount: '',
    page: 1,
    limit: 10,
  });

  const { data: donorsData, isLoading: donorsLoading } = useGetDonorsQuery(filters);
  
  // Dropdown Paginations
  const [triggerGetCities] = useLazyGetCitiesQuery();
  const cityPagination = useDropdownPagination(triggerGetCities);

  const [triggerGetTalukas] = useLazyGetSubLocationsQuery();
  const talukaPagination = useDropdownPagination(triggerGetTalukas, {
    additionalParams: { parentId: filters.cityId },
    skip: !filters.cityId
  });

  const [triggerGetVillages] = useLazyGetSubLocationsQuery();
  const villagePagination = useDropdownPagination(triggerGetVillages, {
    additionalParams: { parentId: filters.talukaId },
    skip: !filters.talukaId
  });

  const donors = donorsData?.data?.donors || [];
  const pagination = {
    currentPage: donorsData?.data?.currentPage || 1,
    totalPages: donorsData?.data?.totalPages || 1,
    totalData: donorsData?.data?.totalData || 0,
    limit: donorsData?.data?.limit || 10,
  };  

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cityId') {
      setFilters(prev => ({ ...prev, cityId: value, talukaId: '', villageId: '', page: 1 }));
      talukaPagination.reset();
      villagePagination.reset();
      return;
    }
    if (name === 'talukaId') {
      setFilters(prev => ({ ...prev, talukaId: value, villageId: '', page: 1 }));
      villagePagination.reset();
      return;
    }

    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ 
      name: '', 
      mobileNumber: '', 
      cityId: '', 
      talukaId: '', 
      villageId: '', 
      minAmount: '', 
      maxAmount: '', 
      page: 1, 
      limit: 10 
    });
    cityPagination.reset();
    talukaPagination.reset();
    villagePagination.reset();
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
        cityPagination={cityPagination}
        talukaPagination={talukaPagination}
        villagePagination={villagePagination}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Donors;
