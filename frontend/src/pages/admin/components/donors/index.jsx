import DonorsList from './DonorsList';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import { 
  useGetDonorsQuery
} from '../../../../services/donationApi';
import { useTable } from '../../../../hooks/useTable';
// import {
//   useLazyGetCitiesQuery
// } from '../../../../services/masterApi';
// import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';

const Donors = () => {
  const initialFilters = {
    name: '',
    mobileNumber: '',
    city: '',
    state: '',
    minAmount: '',
    maxAmount: '',
    page: 1,
    limit: 10,
  };
  const { filters, handleFilterChange, clearFilters, handlePageChange, handleLimitChange } = useTable({
    initialFilters,
    allFlagKey: 'fetchAll',
  });

  const { data: donorsData, isLoading: donorsLoading } = useGetDonorsQuery(filters);
  
  const donors = donorsData?.data?.items || [];
  const pagination = {
    currentPage: donorsData?.data?.currentPage || 1,
    totalPages: donorsData?.data?.totalPages || 1,
    totalData: donorsData?.data?.totalData || 0,
    limit: donorsData?.data?.limit || 10,
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
        onLimitChange={handleLimitChange}
      />
    </div>
  );
};

export default Donors;
