import React, { useState, useEffect } from 'react';
import { 
  useGetAllDonationsQuery, 
  useLazyGetCitiesQuery,
  useLazyGetSubLocationsQuery,
  useLazyGetGaushalasQuery,
  useLazyGetKathasQuery,
  useLazyGetCategoriesQuery
} from '../../../../services/apiSlice';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { 
  Search, Calendar, Loader2, IndianRupee, FileDown, 
  MapPin, MapPinHouse, Building2, Mic2, Tag, Filter, 
  FileSpreadsheet, FileText, ChevronDown, CreditCard 
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import Pagination from '../../../../components/common/Pagination';
import { getStatusColor } from '../../../../utils/tableUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
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
    fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,donorId,gaushalaId,kathaId'
  });

  const { data: donationsData, isLoading: loading } = useGetAllDonationsQuery(filters);

  // Separate query to fetch all records for export
  const exportFilters = { ...filters, fetchAll: true, limit: 1000, page: 1 };
  const { data: exportData } = useGetAllDonationsQuery(exportFilters);
  
  // City Pagination
  const [triggerGetCities] = useLazyGetCitiesQuery();
  const cityPagination = useDropdownPagination(triggerGetCities, { limit: 20 });

  // Taluka Pagination
  const [triggerGetTalukas] = useLazyGetSubLocationsQuery();
  const talukaPagination = useDropdownPagination(triggerGetTalukas, { 
    limit: 20, 
    additionalParams: { parentId: filters.cityId },
    skip: !filters.cityId 
  });

  // Village Pagination
  const [triggerGetVillages] = useLazyGetSubLocationsQuery();
  const villagePagination = useDropdownPagination(triggerGetVillages, { 
    limit: 20, 
    additionalParams: { parentId: filters.talukaId },
    skip: !filters.talukaId 
  });

  // Gaushala Pagination
  const [triggerGetGaushalas] = useLazyGetGaushalasQuery();
  const gaushalaPagination = useDropdownPagination(triggerGetGaushalas, { 
    limit: 20, 
    additionalParams: { locationId: filters.villageId || filters.talukaId || filters.cityId },
    rowsKey: 'rows'
  });

  // Katha Pagination
  const [triggerGetKathas] = useLazyGetKathasQuery();
  const kathaPagination = useDropdownPagination(triggerGetKathas, { 
    limit: 20, 
    additionalParams: { locationId: filters.villageId || filters.talukaId || filters.cityId },
    rowsKey: 'rows'
  });

  // Category Pagination
  const [triggerGetCategories] = useLazyGetCategoriesQuery();
  const categoryPagination = useDropdownPagination(triggerGetCategories, { 
    limit: 20, 
    additionalParams: { all: true }
  });

  const filterCities = cityPagination.items;
  const filterTalukas = talukaPagination.items;
  const filterVillages = villagePagination.items;
  const filterGaushalas = gaushalaPagination.items;
  const filterKathas = kathaPagination.items;
  const categories = categoryPagination.items;

  const donations = donationsData?.data?.donations || [];
  const exportDonations = exportData?.data?.donations || [];
  const pagination = {
    currentPage: donationsData?.data?.currentPage || 1,
    totalPages: donationsData?.data?.totalPages || 1,
    totalData: donationsData?.data?.totalData || 0,
    limit: donationsData?.data?.limit || 10
  };

  const handlePageChange = (page) => setFilters(prev => ({ ...prev, page }));
  const handleLimitChange = (value) => {
    if (value === 'all') {
      setFilters(prev => ({ ...prev, fetchAll: true, limit: 1000, page: 1 }));
    } else {
      setFilters(prev => ({ ...prev, fetchAll: false, limit: value, page: 1 }));
    }
  };

  const getDynamicFileName = (extension) => {
    let nameParts = ['Donations'];
    
    if (filters.gaushalaId) {
      const gName = filterGaushalas.find(g => g.id === filters.gaushalaId)?.name;
      if (gName) nameParts.push(gName);
    }
    if (filters.kathaId) {
      const kName = filterKathas.find(k => k.id === filters.kathaId)?.name;
      if (kName) nameParts.push(kName);
    }
    if (filters.categoryId) {
      const cName = categories.find(c => c.id === filters.categoryId)?.name;
      if (cName) nameParts.push(cName);
    }
    if (filters.status) {
      nameParts.push(filters.status.charAt(0).toUpperCase() + filters.status.slice(1));
    }
    if (filters.startDate) {
      nameParts.push(filters.startDate);
    }
    if (filters.endDate && filters.endDate !== filters.startDate) {
      nameParts.push(filters.endDate);
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    if (nameParts.length === 1) nameParts.push(timestamp);
    
    return `${nameParts.join('_')}.${extension}`;
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
      fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,donorId,gaushalaId,kathaId'
    });
    cityPagination.reset();
    talukaPagination.reset();
    villagePagination.reset();
    gaushalaPagination.reset();
    kathaPagination.reset();
    categoryPagination.reset();
  };

  const exportToExcel = () => {
    if (exportDonations.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = exportDonations.map(d => ({
      'Donor Name': d.donor?.name || '-',
      'Mobile': d.donor?.mobileNumber || '-',
      'Cause': d.cause || '-',
      'Gaushala/Katha': (d.gaushala?.name || d.katha?.name || '-'),
      'Location': `${d.donor?.village || ''}, ${d.donor?.district || ''}`,
      'Reference': d.referenceName || '-',
      'Mode': d.paymentMode?.toUpperCase() || '-',
      'Amount': d.amount,
      'Status': d.status?.toUpperCase() || '-',
      'Date': d.paymentDate ? new Date(d.paymentDate).toLocaleDateString() : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Donations Report");
    const fileName = getDynamicFileName('xlsx');
    XLSX.writeFile(wb, fileName);
    toast.success(`${fileName} downloaded`);
  };

  const exportToPDF = () => {
    if (exportDonations.length === 0) {
      toast.error('No data to export');
      return;
    }

    const doc = new jsPDF('landscape');
    const fileName = getDynamicFileName('pdf');
    doc.text("Donations Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    // Add filter summary to PDF if filters applied
    let yPos = 28;
    const activeFilters = [];
    if (filters.gaushalaId) activeFilters.push(`Gaushala: ${filterGaushalas.find(g => g.id === filters.gaushalaId)?.name}`);
    if (filters.kathaId) activeFilters.push(`Katha: ${filterKathas.find(k => k.id === filters.kathaId)?.name}`);
    if (filters.categoryId) activeFilters.push(`Category: ${categories.find(c => c.id === filters.categoryId)?.name}`);
    if (filters.status) activeFilters.push(`Status: ${filters.status.toUpperCase()}`);
    if (filters.startDate || filters.endDate) activeFilters.push(`Date: ${filters.startDate || ''} to ${filters.endDate || ''}`);
    
    if (activeFilters.length > 0) {
      doc.setFontSize(8);
      doc.text(`Filters: ${activeFilters.join(' | ')}`, 14, yPos);
      yPos += 5;
    }

    const tableHeaders = [['Donor Name', 'Cause', 'Gaushala/Katha', 'Location', 'Mode', 'Amount', 'Status', 'Date']];
    const tableData = exportDonations.map(d => [
      d.donor?.name || '-',
      d.cause || '-',
      (d.gaushala?.name || d.katha?.name || '-'),
      `${d.donor?.village || ''}, ${d.donor?.district || ''}`,
      d.paymentMode?.toUpperCase() || '-',
      `Rs. ${Number(d.amount).toLocaleString('en-IN')}`,
      d.status?.toUpperCase() || '-',
      d.paymentDate ? new Date(d.paymentDate).toLocaleDateString() : '-'
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: yPos + 2,
      theme: 'striped',
      headStyles: { fillColor: [63, 81, 181] },
      styles: { fontSize: 8 }
    });

    doc.save(fileName);
    toast.success(`${fileName} downloaded`);
  };

  const filterFields = [
    { name: 'search', label: 'Search Donor', icon: Search, placeholder: 'Name, Email or Mobile...' },
    { 
      name: 'cityId', 
      label: 'City', 
      type: 'select', 
      icon: MapPin, 
      options: filterCities.map(c => ({ value: c.id, label: c.name })),
      isServerSearch: true,
      onSearchChange: cityPagination.handleSearch,
      onLoadMore: cityPagination.handleLoadMore,
      hasMore: cityPagination.hasMore,
      loading: cityPagination.loading
    },
    { 
      name: 'talukaId', 
      label: 'Taluka', 
      type: 'select', 
      icon: MapPinHouse,
      disabled: !filters.cityId,
      options: filterTalukas.map(t => ({ value: t.id, label: t.name })),
      isServerSearch: true,
      onSearchChange: talukaPagination.handleSearch,
      onLoadMore: talukaPagination.handleLoadMore,
      hasMore: talukaPagination.hasMore,
      loading: talukaPagination.loading
    },
    { 
      name: 'villageId', 
      label: 'Village', 
      type: 'select', 
      icon: Building2,
      disabled: !filters.talukaId,
      options: filterVillages.map(v => ({ value: v.id, label: v.name })),
      isServerSearch: true,
      onSearchChange: villagePagination.handleSearch,
      onLoadMore: villagePagination.handleLoadMore,
      hasMore: villagePagination.hasMore,
      loading: villagePagination.loading
    },
    { 
      name: 'gaushalaId', 
      label: 'Gaushala', 
      type: 'select', 
      icon: Building2,
      options: filterGaushalas.map(g => ({ value: g.id, label: g.name })),
      isServerSearch: true,
      onSearchChange: gaushalaPagination.handleSearch,
      onLoadMore: gaushalaPagination.handleLoadMore,
      hasMore: gaushalaPagination.hasMore,
      loading: gaushalaPagination.loading
    },
    { 
      name: 'kathaId', 
      label: 'Katha', 
      type: 'select', 
      icon: Mic2,
      options: filterKathas.map(k => ({ value: k.id, label: k.name })),
      isServerSearch: true,
      onSearchChange: kathaPagination.handleSearch,
      onLoadMore: kathaPagination.handleLoadMore,
      hasMore: kathaPagination.hasMore,
      loading: kathaPagination.loading
    },
    { 
      name: 'categoryId', 
      label: 'Category', 
      type: 'select', 
      icon: Tag,
      options: categories.map(cat => ({ value: cat.id, label: cat.name })),
      isServerSearch: true,
      onSearchChange: categoryPagination.handleSearch,
      onLoadMore: categoryPagination.handleLoadMore,
      hasMore: categoryPagination.hasMore,
      loading: categoryPagination.loading
    },
    { 
      name: 'status', 
      label: 'Payment Status', 
      type: 'select', 
      icon: CreditCard,
      options: [
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' }
      ]
    },
    { name: 'startDate', label: 'From Date', type: 'date', icon: Calendar },
    { name: 'endDate', label: 'To Date', type: 'date', icon: Calendar },
    { name: 'minAmount', label: 'Min Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 0' },
    { name: 'maxAmount', label: 'Max Amount', type: 'number', icon: IndianRupee, placeholder: '₹ 10000+' },
  ];

  const tableHeaders = [
    { label: 'Donor Name' },
    { label: 'Cause / Purpose' },
    { label: 'Gaushala / Katha' },
    { label: 'Location' },
    { label: 'Amount', className: 'text-right' },
    { label: 'Status' },
    { label: 'Payment Date' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <AdminPageHeader 
          title="Custom Reports" 
          subtitle="Generate and download donation reports with advanced filters"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToExcel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold text-sm shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button 
            onClick={exportToPDF}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-sm shadow-sm"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        fields={filterFields}
      />

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500">Total Records:</span>
          <span className="ml-2 font-bold text-gray-800">{exportDonations.length}</span>
        </div>
        <div>
          <span className="text-sm text-gray-500">Total Amount:</span>
          <span className="ml-2 inline-flex items-center gap-0.5 font-bold text-blue-700">
            <IndianRupee className="w-3.5 h-3.5" />
            {exportDonations.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <AdminTable 
        headers={tableHeaders} 
        isLoading={loading}
        emptyMessage="No donations found with current filters."
      >
        {donations.map((donation) => (
          <tr key={donation.id} className="hover:bg-gray-50 transition">
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <div className="font-medium text-gray-800 text-sm">{donation.donor?.name}</div>
              <div className="text-[10px] text-gray-500">{donation.donor?.mobileNumber}</div>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <div className="text-gray-800 text-sm truncate max-w-[150px]" title={donation.cause}>
                {donation.cause || 'General Donation'}
              </div>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <div className="text-[10px] font-bold text-blue-600 uppercase">
                {donation.gaushala?.name ? `Gaushala: ${donation.gaushala.name}` : (donation.katha?.name ? `Katha: ${donation.katha.name}` : '-')}
              </div>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <div className="text-sm text-gray-700">{donation.donor?.village || '-'}, {donation.donor?.district || '-'}</div>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6 text-right">
              <div className="inline-flex items-center justify-end gap-0.5 text-sm font-bold text-blue-700">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(donation.amount || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-gray-500 uppercase">{donation.paymentMode}</div>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <span className={`text-xs font-bold uppercase ${getStatusColor(donation.status)}`}>
                {donation.status}
              </span>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <div className="text-sm text-gray-700">
                {donation.paymentDate ? new Date(donation.paymentDate).toLocaleDateString() : '-'}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Pagination
        pagination={pagination}
        filters={filters}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
};

export default Reports;
