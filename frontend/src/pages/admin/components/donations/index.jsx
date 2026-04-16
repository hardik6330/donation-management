import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../../../hooks/useDebounce';
import DonationList from './DonationList';
import AddDonationModal from './AddDonationModal';
import EditPartialPaymentModal from './EditPartialPaymentModal';
import AddPartialPaymentModal from './AddPartialPaymentModal';
import EditPayLaterModal from './EditPayLaterModal';
import usePermissions from '../../../../hooks/usePermissions';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { useGetAllDonationsQuery, useResendWhatsAppMutation } from '../../../../services/donationApi';
import { useLazyGetGaushalasQuery } from '../../../../services/gaushalaApi';
import { useLazyGetKathasQuery } from '../../../../services/kathaApi';
import { useLazyGetCategoriesQuery } from '../../../../services/masterApi';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { toast } from 'react-toastify';

const Donation = () => {
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartialDonation, setEditingPartialDonation] = useState(null);
  const [addingPartialDonation, setAddingPartialDonation] = useState(null);
  const [editingPayLaterDonation, setEditingPayLaterDonation] = useState(null);
  const [searchParams] = useSearchParams();

  const [resendWhatsApp, { isLoading: isResending }] = useResendWhatsAppMutation();

  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    categoryId: '',
    city: '',
    gaushalaId: searchParams.get('gaushalaId') || '',
    kathaId: searchParams.get('kathaId') || '',
    status: '',
    page: 1,
    limit: 10,
    fetchAll: false,
    fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,slipUrl,paidAmount,remainingAmount,'
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const queryFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch
  }), [filters, debouncedSearch]);

  // API calls
  const { data: donationsData, isLoading: loading } = useGetAllDonationsQuery(queryFilters);
  
  const [triggerGetGaushalas] = useLazyGetGaushalasQuery();
  const gaushalaPagination = useDropdownPagination(triggerGetGaushalas, {
    rowsKey: 'rows'
  });

  const [triggerGetKathas] = useLazyGetKathasQuery();
  const kathaPagination = useDropdownPagination(triggerGetKathas, {
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
      city: '',
      gaushalaId: '',
      kathaId: '',
      status: '',
      page: 1,
      limit: 10,
      fetchAll: false,
      fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,slipUrl,paidAmount,remainingAmount'
    });
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
    } else if (donation.status === 'completed') {
      toast.info('રસીદ તૈયાર થઈ રહી છે, કૃપા કરીને થોડીવાર પછી પ્રયત્ન કરો.');
    }
  };

  const handleEditPartialPayment = (donation) => {
    setEditingPartialDonation(donation);
  };

  const handleAddPartialPayment = (donation) => {
    setAddingPartialDonation(donation);
  };

  const handleEditPayLater = (donation) => {
    setEditingPayLaterDonation(donation);
  };

  const handleResendWhatsApp = async (donation) => {
    try {
      await resendWhatsApp(donation.id).unwrap();
      toast.success('WhatsApp message resent successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to resend WhatsApp message');
    }
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
        onEditPayLater={handleEditPayLater}
        onResendWhatsApp={handleResendWhatsApp}
        isResending={isResending}
        hasPermission={hasPermission} 
      />

      {isModalOpen && (
        <AddDonationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          gaushalaPagination={gaushalaPagination}
          kathaPagination={kathaPagination}
          categoryPagination={activeCategoryPagination}
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

      {editingPayLaterDonation && (
        <EditPayLaterModal
          isOpen={!!editingPayLaterDonation}
          donation={editingPayLaterDonation}
          onClose={() => setEditingPayLaterDonation(null)}
        />
      )}
    </div>
  );
};

export default Donation;
