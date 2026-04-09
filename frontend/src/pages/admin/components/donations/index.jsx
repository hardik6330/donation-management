import React, { useState } from 'react';
import DonationList from './DonationList';
import AddDonationModal from './AddDonationModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetAllDonationsQuery, 
  useGetCitiesQuery,
  useGetSubLocationsQuery,
  useGetGaushalasQuery,
  useGetKathasQuery,
  useGetCategoriesQuery
} from '../../../../services/apiSlice';

const Donation = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    status: '',
    page: 1,
    limit: 10,
    fetchAll: false,
    fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,slipUrl,'
  });

  // API calls moved to index.jsx
  const { data: donationsData, isLoading: loading } = useGetAllDonationsQuery(filters);
  const { data: categoriesData } = useGetCategoriesQuery();

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

  const handleAdd = () => {
    setIsModalOpen(true);
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

  const clearFilters = () => setFilters({
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
    status: '',
    page: 1,
    limit: 10,
    fetchAll: false,
    fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,slipUrl,village,district'
  });

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Donation Management" 
        subtitle="View and manage all system donations"
        buttonText={hasPermission('donations', 'entry') ? "Add Donation" : null}
        onButtonClick={handleAdd}
      />

      <DonationList 
        donations={donations}
        isLoading={loading}
        pagination={pagination}
        filters={filters}
        filterData={{
          cities: filterCities,
          talukas: filterTalukas,
          villages: filterVillages,
          gaushalas: filterGaushalas,
          kathas: filterKathas,
          categories: categories
        }}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddDonationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Donation;
