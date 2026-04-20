import React, { useState, useEffect } from 'react';
import { 
  useGetAllDonationsQuery
} from '../../../../services/donationApi';
import {
  useLazyGetCategoriesQuery
} from '../../../../services/masterApi';
import { useLazyGetGaushalasQuery } from '../../../../services/gaushalaApi';
import { useLazyGetKathasQuery } from '../../../../services/kathaApi';
import { useDropdownPagination } from '../../../../hooks/useDropdownPagination';
import { useTable } from '../../../../hooks/useTable';
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
  const [gujaratiFontBase64, setGujaratiFontBase64] = useState(null);
  const [gujaratiBoldFontBase64, setGujaratiBoldFontBase64] = useState(null);

  const loadFontAsBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading font:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadFonts = async () => {
      const regularFont = await loadFontAsBase64('/fonts/NotoSansGujarati-Regular.ttf');
      const boldFont = await loadFontAsBase64('/fonts/NotoSansGujarati-Bold.ttf');
      if (regularFont) {
        setGujaratiFontBase64(regularFont);
      }
      if (boldFont) {
        setGujaratiBoldFontBase64(boldFont);
      }
    };
    loadFonts();
  }, []);

  const {
    filters,
    setFilters,
    handlePageChange,
    handleLimitChange,
    clearFilters,
  } = useTable({
    initialFilters: {
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
      fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,donorId,gaushalaId,kathaId'
    },
    allLimit: 1000,
  });

  const { data: donationsData, isLoading: loading } = useGetAllDonationsQuery(filters);

  // Separate query to fetch all records for export
  const exportFilters = { ...filters, fetchAll: true, limit: 1000, page: 1 };
  const { data: exportData } = useGetAllDonationsQuery(exportFilters);
  
  // Gaushala Pagination
  const [triggerGetGaushalas] = useLazyGetGaushalasQuery();
  const gaushalaPagination = useDropdownPagination(triggerGetGaushalas, {
    limit: 20,
  });

  // Katha Pagination
  const [triggerGetKathas] = useLazyGetKathasQuery();
  const kathaPagination = useDropdownPagination(triggerGetKathas, {
    limit: 20,
  });

  // Category Pagination
  const [triggerGetCategories] = useLazyGetCategoriesQuery();
  const categoryPagination = useDropdownPagination(triggerGetCategories, {
    limit: 20,
    additionalParams: { all: true }
  });

  const filterGaushalas = gaushalaPagination.items;
  const filterKathas = kathaPagination.items;
  const categories = categoryPagination.items;

  const donations = donationsData?.data?.items || [];
  const exportDonations = exportData?.data?.items || [];
  const pagination = {
    currentPage: donationsData?.data?.currentPage || 1,
    totalPages: donationsData?.data?.totalPages || 1,
    totalData: donationsData?.data?.totalData || 0,
    limit: donationsData?.data?.limit || 10
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
    
    setFilters(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value,
      page: 1
    }));
  };

  const handleClearFilters = () => {
    clearFilters();
    gaushalaPagination.reset();
    kathaPagination.reset();
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
      'Location': `${d.donor?.city || ''}, ${d.donor?.state || ''}`,
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

  const hasNonLatin = (str) => {
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      if (s.charCodeAt(i) > 127) return true;
    }
    return false;
  };

  const exportToPDF = async () => {
    if (exportDonations.length === 0) {
      toast.error('No data to export');
      return;
    }

    const doc = new jsPDF('landscape');
    
    // Load custom fonts if available
    let fontName = 'helvetica';
    let boldFontName = 'helvetica';
    
    if (gujaratiFontBase64 && gujaratiBoldFontBase64) {
      try {
        // Add custom fonts to jsPDF
        const regularFontData = gujaratiFontBase64.split(',')[1];
        const boldFontData = gujaratiBoldFontBase64.split(',')[1];
        
        doc.addFileToVFS('NotoSansGujarati-Regular.ttf', regularFontData);
        doc.addFileToVFS('NotoSansGujarati-Bold.ttf', boldFontData);
        
        doc.addFont('NotoSansGujarati-Regular.ttf', 'NotoSansGujarati', 'normal');
        doc.addFont('NotoSansGujarati-Bold.ttf', 'NotoSansGujarati', 'bold');
        
        fontName = 'NotoSansGujarati';
        boldFontName = 'NotoSansGujarati';
        
        doc.setFont(fontName, 'normal');
      } catch (error) {
        console.error('Error loading custom fonts:', error);
        fontName = 'helvetica';
        boldFontName = 'helvetica';
      }
    }

    const fileName = getDynamicFileName('pdf');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("Donations Report", 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
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
      let xOffset = 14;
      doc.text("Filters: ", xOffset, yPos);
      xOffset += doc.getTextWidth("Filters: ");
      
      activeFilters.forEach((filter, index) => {
        const separator = (index < activeFilters.length - 1 ? ' | ' : '');
        const text = filter + separator;
        
        if (hasNonLatin(text)) {
          doc.setFont(fontName, 'normal');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        doc.text(text, xOffset, yPos);
        xOffset += doc.getTextWidth(text);
      });
      yPos += 5;
    }

    const tableHeaders = [['Donor Name', 'Gaushala/Katha', 'Location', 'Mode', 'Amount', 'Status', 'Date']];

    const tableData = exportDonations.map(d => [
      d.donor?.name || '-',
      (d.gaushala?.name || d.katha?.name || '-'),
      `${d.donor?.city || ''}, ${d.donor?.state || ''}`,
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
      headStyles: { 
        fillColor: [63, 81, 181], 
        font: 'helvetica', 
        fontStyle: 'bold',
        textColor: 255
      },
      styles: { 
        font: 'helvetica', 
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const cellText = data.cell.text.join(' ');
          if (hasNonLatin(cellText)) {
            data.cell.styles.font = fontName;
            if (data.cell.styles.fontStyle === 'bold') {
              data.cell.styles.font = boldFontName;
            }
          }
        }
      }
    });

    doc.save(fileName);
    toast.success(`${fileName} downloaded`);
  };

  const filterFields = [
    { name: 'search', label: 'Search Donor', icon: Search, placeholder: 'Name, Email or Mobile...' },
    { name: 'city', label: 'City', icon: MapPin, placeholder: 'Search by city...' },
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
        onClearFilters={handleClearFilters}
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
              <div className="text-sm text-gray-700">{donation.donor?.city || '-'}, {donation.donor?.state || '-'}</div>
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
