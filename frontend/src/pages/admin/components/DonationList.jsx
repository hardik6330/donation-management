import React, { useState, useEffect } from 'react';
import { 
  useGetAllDonationsQuery, 
  useGetCategoriesQuery, 
  useUpdateDonationMutation,
  useCreateOrderMutation,
  useGetUserByMobileQuery,
  useGetCitiesQuery,
  useGetSubLocationsQuery
} from '../../../services/apiSlice';
import { Search, Calendar, Loader2, IndianRupee, Tag, Edit, X, CheckCircle2, Plus, Phone, User, Home as HomeIcon, MapPin, CreditCard, FileDown, Mail, Building2, MapPinHouse, UserCheck, ChevronDown, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminPageHeader from '../../../components/common/AdminPageHeader';
import AdminTable from '../../../components/common/AdminTable';
import AdminModal from '../../../components/common/AdminModal';

const DonationList = () => {
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    categoryId: '',
    page: 1,
    limit: 10,
    fetchAll: false,
    fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,slipUrl'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: '',
    paymentMode: '',
    paymentDate: '',
    status: ''
  });

  const [addForm, setAddForm] = useState({
    mobileNumber: '',
    name: '',
    email: '',
    address: '',
    village: '',
    district: '',
    cityId: '',
    talukaId: '',
    villageId: '',
    categoryId: '',
    companyName: '',
    referenceName: '',
    amount: '',
    paymentMode: 'cash',
  });

  const [addDropdownLabels, setAddDropdownLabels] = useState({
    cityName: '',
    talukaName: '',
    villageName: '',
    categoryName: '',
    paymentModeName: 'Cash',
  });
  const [activeAddDropdown, setActiveAddDropdown] = useState(null);

  const { data: donationsData, isLoading: loading } = useGetAllDonationsQuery(filters);
  const { data: categoriesData } = useGetCategoriesQuery();
  const [updateDonation, { isLoading: isUpdating }] = useUpdateDonationMutation();
  const [createDonation, { isLoading: isAdding }] = useCreateOrderMutation();

  // Location and User Data for Add Modal
  const { data: citiesData } = useGetCitiesQuery();
  const { data: talukasData } = useGetSubLocationsQuery(addForm.cityId, { skip: !addForm.cityId });
  const { data: villagesData } = useGetSubLocationsQuery(addForm.talukaId, { skip: !addForm.talukaId });
  
  const cities = citiesData?.data || [];
  const talukas = talukasData?.data || [];
  const villages = villagesData?.data || [];

  const { data: existingUser } = useGetUserByMobileQuery(addForm.mobileNumber, {
    skip: addForm.mobileNumber.length !== 10 || !isAddModalOpen,
  });

  // Close add dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveAddDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Auto-fill form when user is found
   useEffect(() => {
     if (existingUser?.success && existingUser.data) {
       const user = existingUser.data;
       const timer = setTimeout(() => {
         setAddForm(prev => ({
           ...prev,
           name: user.name || '',
           email: user.email || '',
           address: user.address || '',
           village: user.village || '',
           district: user.district || '',
           cityId: user.cityId || '',
           talukaId: user.talukaId || '',
           villageId: user.villageId || '',
           companyName: user.companyName || '',
         }));
       }, 0);
       toast.info('User found! Details auto-filled.');
       return () => clearTimeout(timer);
     }
   }, [existingUser]);

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'mobileNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setAddForm(prev => ({ ...prev, [name]: cleaned }));
      return;
    }

    if (name === 'cityName') {
      setAddDropdownLabels(prev => ({ ...prev, cityName: value, talukaName: '', villageName: '' }));
      setAddForm(prev => ({ ...prev, cityId: '', talukaId: '', villageId: '' }));
      setActiveAddDropdown('cityName');
      return;
    }
    if (name === 'talukaName') {
      setAddDropdownLabels(prev => ({ ...prev, talukaName: value, villageName: '' }));
      setAddForm(prev => ({ ...prev, talukaId: '', villageId: '' }));
      setActiveAddDropdown('talukaName');
      return;
    }
    if (name === 'villageName') {
      setAddDropdownLabels(prev => ({ ...prev, villageName: value }));
      setAddForm(prev => ({ ...prev, villageId: '' }));
      setActiveAddDropdown('villageName');
      return;
    }
    if (name === 'categoryName') {
      setAddDropdownLabels(prev => ({ ...prev, categoryName: value }));
      setAddForm(prev => ({ ...prev, categoryId: '' }));
      setActiveAddDropdown('categoryName');
      return;
    }
    if (name === 'paymentModeName') {
      setAddDropdownLabels(prev => ({ ...prev, paymentModeName: value }));
      setActiveAddDropdown('paymentModeName');
      return;
    }

    if (name === 'amount') {
      const rawValue = value.replace(/,/g, '');
      if (rawValue === '' || /^\d+$/.test(rawValue)) {
        const formattedValue = rawValue === '' ? '' : Number(rawValue).toLocaleString('en-IN');
        setAddForm(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }

    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDropdownSelect = (field, id, name) => {
    if (field === 'cityId') {
      setAddForm(prev => ({ ...prev, cityId: id, talukaId: '', villageId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, cityName: name, talukaName: '', villageName: '' }));
    } else if (field === 'talukaId') {
      setAddForm(prev => ({ ...prev, talukaId: id, villageId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, talukaName: name, villageName: '' }));
    } else if (field === 'villageId') {
      setAddForm(prev => ({ ...prev, villageId: id }));
      setAddDropdownLabels(prev => ({ ...prev, villageName: name }));
    } else if (field === 'categoryId') {
      setAddForm(prev => ({ ...prev, categoryId: id }));
      setAddDropdownLabels(prev => ({ ...prev, categoryName: name }));
    } else if (field === 'paymentMode') {
      setAddForm(prev => ({ ...prev, paymentMode: id }));
      setAddDropdownLabels(prev => ({ ...prev, paymentModeName: name }));
    }
    setActiveAddDropdown(null);
  };

  const renderAddDropdown = (dropdownKey, items, formField) => {
    const searchText = addDropdownLabels[dropdownKey] || '';
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    if (activeAddDropdown !== dropdownKey || filtered.length === 0) return null;
    return (
      <div
        className="absolute z-[110] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleAddDropdownSelect(formField, item.id, item.name)}
            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm font-medium text-gray-700 transition-colors border-b border-gray-50 last:border-0"
          >
            {item.name}
          </button>
        ))}
      </div>
    );
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const rawAmount = addForm.amount.toString().replace(/,/g, '');
    
    try {
      await createDonation({
        ...addForm,
        amount: rawAmount
      }).unwrap();
      toast.success('Donation added successfully');
      setIsAddModalOpen(false);
      setAddForm({
        mobileNumber: '',
        name: '',
        email: '',
        address: '',
        village: '',
        district: '',
        cityId: '',
        talukaId: '',
        villageId: '',
        categoryId: '',
        companyName: '',
        referenceName: '',
        amount: '',
        paymentMode: 'cash',
      });
      setAddDropdownLabels({ cityName: '', talukaName: '', villageName: '', categoryName: '', paymentModeName: 'Cash' });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add donation');
    }
  };

  const donations = donationsData?.data?.donations || [];
  const categories = categoriesData?.data || [];
  const pagination = {
    currentPage: donationsData?.data?.currentPage || 1,
    totalPages: donationsData?.data?.totalPages || 1,
    totalData: donationsData?.data?.totalData || 0,
    limit: donationsData?.data?.limit || 10
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({ 
      search: '', 
      startDate: '', 
      endDate: '', 
      minAmount: '', 
      maxAmount: '',
      categoryId: '',
      page: 1, 
      limit: 10, 
      fetchAll: false, 
      fields: 'id,amount,cause,status,paymentMode,createdAt,paymentDate,referenceName,slipUrl' 
    });
  };

  const handleEditClick = (donation) => {
    setEditingDonation(donation);
    setEditForm({
      amount: donation.amount,
      paymentMode: donation.paymentMode,
      paymentDate: donation.paymentDate ? new Date(donation.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: donation.status
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDonation({
        id: editingDonation.id,
        ...editForm,
        // If they changed status to completed, ensure paymentDate is set
        paymentDate: editForm.status === 'completed' && !editForm.paymentDate ? new Date() : editForm.paymentDate
      }).unwrap();
      toast.success('Donation updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update donation');
    }
  };

  const tableHeaders = [
    { label: 'Donor Name' },
    { label: 'Cause / Purpose' },
    { label: 'Village / District' },
    { label: 'Reference' },
    { label: 'Mode' },
    { label: 'Amount' },
    { label: 'Status' },
    { label: 'Payment Date' },
    { label: 'Actions' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Donation Records" 
        subtitle="View and filter all your donation transactions"
        buttonText="Add Donation"
        onButtonClick={() => setIsAddModalOpen(true)}
      />

      {/* Filters Section */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex sm:hidden items-center justify-between w-full py-1 text-xs font-bold text-gray-500 uppercase tracking-wider"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filters</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMobileFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className="hidden sm:flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50 pb-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>

        <div className={`${showMobileFilters ? 'block' : 'hidden'} sm:block mt-4 sm:mt-0`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Search className="w-3 h-3" /> Search Donor
            </label>
            <input
              name="search"
              placeholder="Name, Email or Mobile..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <IndianRupee className="w-3 h-3" /> Amount Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minAmount"
                placeholder="Min"
                value={filters.minAmount}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="number"
                name="maxAmount"
                placeholder="Max"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Tag className="w-3 h-3" /> Category
            </label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
              <Calendar className="w-3 h-3" /> End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="flex flex-row sm:flex-col lg:flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="checkbox"
                name="fetchAll"
                id="fetchAll"
                checked={filters.fetchAll}
                onChange={handleFilterChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="fetchAll" className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase cursor-pointer whitespace-nowrap">
                Fetch All
              </label>
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg text-xs sm:text-sm transition whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>
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
              <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{donation.donor?.email}</div>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <div className="text-gray-800 text-sm font-medium line-clamp-2 max-w-[200px]" title={donation.cause}>
                {donation.cause || 'General Donation'}
              </div>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6 text-gray-600 text-[10px] sm:text-sm">
              {donation.donor?.village || '-'} / {donation.donor?.district || '-'}
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6 text-gray-600 text-[10px] sm:text-sm italic">
              {donation.referenceName || '-'}
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <span className={`text-[10px] font-bold uppercase ${
                donation.paymentMode === 'cash' ? 'text-orange-600' : 
                donation.paymentMode === 'pay_later' ? 'text-purple-600' : 'text-blue-600'
              }`}>
                {donation.paymentMode?.replace('_', ' ') || 'online'}
              </span>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6 font-bold text-gray-800 text-sm">₹{donation.amount}</td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <span className={`text-[10px] font-bold uppercase ${
                donation.status === 'completed' ? 'text-green-600' : 
                donation.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {donation.status}
              </span>
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6 text-gray-500 text-[10px] sm:text-sm whitespace-nowrap">
              {donation.paymentDate ? new Date(donation.paymentDate).toLocaleDateString() : '-'}
            </td>
            <td className="p-3 sm:p-4 px-4 sm:px-6">
              <div className="flex items-center gap-1">
                {donation.slipUrl && (
                  <a
                    href={donation.slipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition inline-flex"
                    title="Download Slip"
                  >
                    <FileDown className="w-4 h-4" />
                  </a>
                )}
                {donation.paymentMode === 'pay_later' && donation.status !== 'completed' && (
                  <button
                    onClick={() => handleEditClick(donation)}
                    className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                    title="Edit Donation"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Pagination UI */}
      {pagination.totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Showing <span className="font-bold">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span> records
          </p>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pagination.totalPages > 5 && (pageNum < pagination.currentPage - 1 || pageNum > pagination.currentPage + 1) && pageNum !== 1 && pageNum !== pagination.totalPages) {
                  if (pageNum === pagination.currentPage - 2 || pageNum === pagination.currentPage + 2) {
                    return <span key={pageNum} className="text-gray-400">...</span>;
                  }
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-bold transition ${
                      pagination.currentPage === pageNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Donation"
        icon={<Edit />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <IndianRupee className="w-3 h-3" /> Amount
              </label>
              <input
                type="number"
                required
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                Payment Mode
              </label>
              <select
                required
                value={editForm.paymentMode}
                onChange={(e) => setEditForm(prev => ({ ...prev, paymentMode: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="online">Online</option>
                <option value="cash">Cash</option>
                <option value="pay_later">Pay Later</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Payment Date
              </label>
              <input
                type="date"
                required
                value={editForm.paymentDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                Status
              </label>
              <select
                required
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
            >
              {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Update Donation
            </button>
          </div>
        </form>
      </AdminModal>
      {/* Add Donation Modal */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Donation"
        icon={<Plus />}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-6 sm:space-y-8">
          {/* User Details Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wider border-b border-blue-50 pb-2">
              <User className="w-4 h-4" /> User Details
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Mobile Number
                </label>
                <input
                  required
                  name="mobileNumber"
                  value={addForm.mobileNumber}
                  onChange={handleAddInputChange}
                  placeholder="10 digit mobile"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  required
                  name="name"
                  value={addForm.name}
                  onChange={handleAddInputChange}
                  placeholder="Donor's full name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={addForm.email}
                  onChange={handleAddInputChange}
                  placeholder="Email (optional)"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <HomeIcon className="w-3 h-3" /> Address
                </label>
                <input
                  name="address"
                  value={addForm.address}
                  onChange={handleAddInputChange}
                  placeholder="Street / House No."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <MapPinHouse className="w-3 h-3" /> Village
                </label>
                <input
                  name="village"
                  value={addForm.village}
                  onChange={handleAddInputChange}
                  placeholder="Enter Village Name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> District
                </label>
                <input
                  name="district"
                  value={addForm.district}
                  onChange={handleAddInputChange}
                  placeholder="Enter District Name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Company Name
                </label>
                <input
                  name="companyName"
                  value={addForm.companyName}
                  onChange={handleAddInputChange}
                  placeholder="Business/Org name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Donation Details Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wider border-b border-blue-50 pb-2">
              <IndianRupee className="w-4 h-4" /> Donation Details
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> City
                </label>
                <input
                  required
                  name="cityName"
                  autoComplete="off"
                  value={addDropdownLabels.cityName}
                  onChange={handleAddInputChange}
                  onFocus={() => setActiveAddDropdown('cityName')}
                  onClick={(e) => { e.stopPropagation(); setActiveAddDropdown('cityName'); }}
                  placeholder="Search City..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                {renderAddDropdown('cityName', cities, 'cityId')}
              </div>
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Taluka
                </label>
                <input
                  name="talukaName"
                  autoComplete="off"
                  value={addDropdownLabels.talukaName}
                  onChange={handleAddInputChange}
                  onFocus={() => setActiveAddDropdown('talukaName')}
                  onClick={(e) => { e.stopPropagation(); setActiveAddDropdown('talukaName'); }}
                  disabled={!addForm.cityId}
                  placeholder="Search Taluka..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                />
                {renderAddDropdown('talukaName', talukas, 'talukaId')}
              </div>
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Village
                </label>
                <input
                  name="villageName"
                  autoComplete="off"
                  value={addDropdownLabels.villageName}
                  onChange={handleAddInputChange}
                  onFocus={() => setActiveAddDropdown('villageName')}
                  onClick={(e) => { e.stopPropagation(); setActiveAddDropdown('villageName'); }}
                  disabled={!addForm.talukaId}
                  placeholder="Search Village..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                />
                {renderAddDropdown('villageName', villages, 'villageId')}
              </div>
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Tag className="w-3 h-3" /> Category
                </label>
                <input
                  required
                  name="categoryName"
                  autoComplete="off"
                  value={addDropdownLabels.categoryName}
                  onChange={handleAddInputChange}
                  onFocus={() => setActiveAddDropdown('categoryName')}
                  onClick={(e) => { e.stopPropagation(); setActiveAddDropdown('categoryName'); }}
                  placeholder="Search Category..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                {renderAddDropdown('categoryName', categories, 'categoryId')}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <UserCheck className="w-3 h-3" /> Reference Name
                </label>
                <input
                  name="referenceName"
                  value={addForm.referenceName}
                  onChange={handleAddInputChange}
                  placeholder="Enter reference person name"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> Mode
                </label>
                <input
                  name="paymentModeName"
                  autoComplete="off"
                  value={addDropdownLabels.paymentModeName}
                  onChange={handleAddInputChange}
                  onFocus={() => setActiveAddDropdown('paymentModeName')}
                  onClick={(e) => { e.stopPropagation(); setActiveAddDropdown('paymentModeName'); }}
                  placeholder="Select Mode..."
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
                />
                {activeAddDropdown === 'paymentModeName' && (
                  <div
                    className="absolute z-[110] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[{ id: 'cash', name: 'Cash' }, { id: 'pay_later', name: 'Pay Later' }].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleAddDropdownSelect('paymentMode', mode.id, mode.name)}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm font-medium text-gray-700 transition-colors border-b border-gray-50 last:border-0"
                      >
                        {mode.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <IndianRupee className="w-3 h-3" /> Amount
                </label>
                <input
                  required
                  name="amount"
                  value={addForm.amount}
                  onChange={handleAddInputChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-lg font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200 order-1 sm:order-2"
            >
              {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Save Donation
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default DonationList;
