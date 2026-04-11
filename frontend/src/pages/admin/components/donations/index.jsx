import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DonationList from './DonationList';
import AddDonationModal from './AddDonationModal';
import EditPartialPaymentModal from './EditPartialPaymentModal';
import AddPartialPaymentModal from './AddPartialPaymentModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import {
  useGetAllDonationsQuery,
  useLazyGetCitiesQuery,
  useLazyGetSubLocationsQuery,
  useLazyGetGaushalasQuery,
  useLazyGetKathasQuery,
  useLazyGetCategoriesQuery
} from '../../../../services/apiSlice';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';

const Donation = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartialDonation, setEditingPartialDonation] = useState(null);
  const [addingPartialDonation, setAddingPartialDonation] = useState(null);
  const [searchParams] = useSearchParams();

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
    gaushalaId: searchParams.get('gaushalaId') || '',
    kathaId: searchParams.get('kathaId') || '',
    status: '',
    page: 1,
    limit: 10,
    fetchAll: false,
    fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,slipUrl,paidAmount,remainingAmount,'
  });

  // API calls
  const { data: donationsData, isLoading: loading } = useGetAllDonationsQuery(filters);
  
  // Dropdown Paginations
  const [modalState, setModalState] = useState({ cityId: '', talukaId: '', villageId: '' });
  const [triggerGetCities] = useLazyGetCitiesQuery();
  const cityPagination = useDropdownPagination(triggerGetCities);

  const [triggerGetTalukas] = useLazyGetSubLocationsQuery();
  const talukaPagination = useDropdownPagination(triggerGetTalukas, {
    additionalParams: { parentId: filters.cityId || modalState.cityId },
    skip: !(filters.cityId || modalState.cityId)
  });

  const [triggerGetVillages] = useLazyGetSubLocationsQuery();
  const villagePagination = useDropdownPagination(triggerGetVillages, {
    additionalParams: { parentId: filters.talukaId || modalState.talukaId },
    skip: !(filters.talukaId || modalState.talukaId)
  });

  const [triggerGetGaushalas] = useLazyGetGaushalasQuery();
  const gaushalaPagination = useDropdownPagination(triggerGetGaushalas, {
    additionalParams: { 
      locationId: modalState.villageId || modalState.talukaId || modalState.cityId || filters.villageId || filters.talukaId || filters.cityId 
    },
    rowsKey: 'rows'
  });

  const [triggerGetKathas] = useLazyGetKathasQuery();
  const kathaPagination = useDropdownPagination(triggerGetKathas, {
    additionalParams: { 
      locationId: modalState.villageId || modalState.talukaId || modalState.cityId || filters.villageId || filters.talukaId || filters.cityId 
    },
    rowsKey: 'rows'
  });

  const [triggerGetCategories] = useLazyGetCategoriesQuery();
  const [triggerGetActiveCategories] = useLazyGetCategoriesQuery();
  const categoryPagination = useDropdownPagination(triggerGetCategories, {
    additionalParams: { all: true }
  });
  const activeCategoryPagination = useDropdownPagination(triggerGetActiveCategories);

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
      talukaPagination.reset();
      villagePagination.reset();
      return;
    }
    if (name === 'talukaId') {
      setFilters(prev => ({ ...prev, talukaId: value, villageId: '', gaushalaId: '', kathaId: '', page: 1 }));
      villagePagination.reset();
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

  const clearFilters = () => {
    setFilters({
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
      fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,slipUrl,paidAmount,remainingAmount,village,district'
    });
    cityPagination.reset();
    talukaPagination.reset();
    villagePagination.reset();
    gaushalaPagination.reset();
    kathaPagination.reset();
    categoryPagination.reset();
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    if (newLimit === 'all') {
      setFilters(prev => ({ ...prev, fetchAll: true, limit: 100, page: 1 }));
    } else {
      setFilters(prev => ({ ...prev, limit: newLimit, fetchAll: false, page: 1 }));
    }
  };

  const handleDownloadSlip = (donation) => {
    if (donation.slipUrl) {
      window.open(donation.slipUrl, '_blank');
    }
  };

  const handleEditPartialPayment = (donation) => {
    setEditingPartialDonation(donation);
  };

  const handleAddPartialPayment = (donation) => {
    setAddingPartialDonation(donation);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Donation Management" 
        subtitle="View and manage all received donations"
        buttonText={hasPermission('donations', 'entry') ? "Add Donation" : null}
        onButtonClick={handleAdd}
      />

      <DonationList 
        donations={donations}
        isLoading={loading}
        pagination={pagination}
        filters={filters}
        cityPagination={cityPagination}
        talukaPagination={talukaPagination}
        villagePagination={villagePagination}
        gaushalaPagination={gaushalaPagination}
        kathaPagination={kathaPagination}
        categoryPagination={categoryPagination}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onDownloadSlip={handleDownloadSlip}
        onEditPartialPayment={handleEditPartialPayment}
        onAddPartialPayment={handleAddPartialPayment}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddDonationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cityPagination={cityPagination}
          talukaPagination={talukaPagination}
          villagePagination={villagePagination}
          gaushalaPagination={gaushalaPagination}
          kathaPagination={kathaPagination}
          categoryPagination={activeCategoryPagination}
          setModalState={setModalState}
        />
      )}

      {editingPartialDonation && (
        <EditPartialPaymentModal
          isOpen={!!editingPartialDonation}
          donation={editingPartialDonation}
          onClose={() => setEditingPartialDonation(null)}
        />
      )}

      {addingPartialDonation && (
        <AddPartialPaymentModal
          isOpen={!!addingPartialDonation}
          donation={addingPartialDonation}
          onClose={() => setAddingPartialDonation(null)}
        />
      )}
    </div>
  );
};

export default Donation;
