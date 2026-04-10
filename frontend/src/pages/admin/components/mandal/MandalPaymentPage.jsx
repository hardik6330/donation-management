import { useState } from 'react';
import {
  useGetMandalPaymentsQuery,
  useGenerateMandalPaymentsMutation,
  useUpdateMandalPaymentMutation,
  useGetMandalReportQuery,
  useGetMandalsQuery
} from '../../../../services/apiSlice';
import {
  Search, Calendar, CheckCircle, XCircle, IndianRupee, UsersRound
} from 'lucide-react';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import AdminPageHeader from '../../../../components/common/AdminPageHeader';
import AdminTable from '../../../../components/common/AdminTable';
import FilterSection from '../../../../components/common/FilterSection';
import { getStatusColor } from '../../../../utils/tableUtils';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonth = (month) => {
  const [year, m] = month.split('-');
  const date = new Date(year, parseInt(m) - 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const MandalPaymentPage = () => {
  const [filters, setFilters] = useState({
    month: getCurrentMonth(),
    mandalId: '',
    status: '',
    search: '',
    page: 1,
    limit: 10
  });

  const { data: paymentsData, isLoading } = useGetMandalPaymentsQuery(filters);
  const { data: reportData } = useGetMandalReportQuery({ month: filters.month });
  const { data: mandalsData } = useGetMandalsQuery({ fetchAll: 'true' });
  const [generatePayments, { isLoading: isGenerating }] = useGenerateMandalPaymentsMutation();
  const [updatePayment] = useUpdateMandalPaymentMutation();

  const payments = paymentsData?.data?.rows || [];
  const pagination = {
    currentPage: paymentsData?.data?.currentPage || 1,
    totalPages: paymentsData?.data?.totalPages || 1,
    totalData: paymentsData?.data?.totalData || 0,
    limit: paymentsData?.data?.limit || 10
  };

  const report = reportData?.data || {};
  const mandals = mandalsData?.data?.rows || [];
  const mandalOptions = mandals.map(m => ({ value: m.id, label: m.name }));

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ month: getCurrentMonth(), mandalId: '', status: '', search: '', page: 1, limit: 10 });
  };

  const handlePageChange = (page) => setFilters(prev => ({ ...prev, page }));

  const handleGenerate = async () => {
    try {
      const result = await generatePayments({ month: filters.month }).unwrap();
      toast.success(result.message || `Generated ${result.data?.generated || 0} records`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to generate payments');
    }
  };

  const togglePaymentStatus = async (payment) => {
    const newStatus = payment.status === 'paid' ? 'unpaid' : 'paid';
    try {
      await updatePayment({ id: payment.id, status: newStatus }).unwrap();
      toast.success(`Marked as ${newStatus}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update payment');
    }
  };

  const tableHeaders = [
    { label: 'Member Name' },
    { label: 'Mobile' },
    { label: 'Mandal' },
    { label: 'Location' },
    { label: 'Amount', className: 'text-right' },
    { label: 'Status' },
    { label: 'Paid Date' },
    { label: 'Action' },
  ];

  const filterFields = [
    { name: 'month', label: 'Month', type: 'month', icon: Calendar },
    { name: 'search', label: 'Search', icon: Search, placeholder: 'Name or Mobile...' },
    { name: 'mandalId', label: 'Mandal', type: 'select', icon: UsersRound, options: mandalOptions, placeholder: 'All Mandals' },
    { name: 'status', label: 'Status', type: 'select', icon: CheckCircle, options: [{ value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' }] }
  ];

  const inr = (val) => Number(val).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Monthly Collections"
        subtitle={`Mandal payment tracking for ${formatMonth(filters.month)}`}
        buttonText={null}
        onButtonClick={null}
      />

      <div className="flex flex-wrap gap-3">
        <NavLink to="/admin/mandal" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-semibold rounded-xl hover:bg-purple-100 transition text-sm border border-purple-100">
          <UsersRound className="w-4 h-4" /> Mandals
        </NavLink>
        <NavLink to="/admin/mandal-members" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition text-sm border border-blue-100">
          <UsersRound className="w-4 h-4" /> Members
        </NavLink>
      </div>

      {/* Stats Cards */}
      {report.totalMembers > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Total Members</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{report.totalMembers}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100">
            <p className="text-[10px] font-bold text-green-600 uppercase">Paid</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{report.paidCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-red-100">
            <p className="text-[10px] font-bold text-red-500 uppercase">Unpaid</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{report.unpaidCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
            <p className="text-[10px] font-bold text-blue-600 uppercase">Collected</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{inr(report.totalCollected)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
            <p className="text-[10px] font-bold text-orange-600 uppercase">Pending</p>
            <p className="text-2xl font-bold text-orange-700 mt-1">{inr(report.totalPending)}</p>
          </div>
        </div>
      )}

      <FilterSection filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} fields={filterFields} />

      <AdminTable headers={tableHeaders} isLoading={isLoading} emptyMessage="No payment records found. Click 'Generate Month' to create records for active members.">
        {payments.map((payment) => (
          <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{payment.member?.name}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{payment.member?.mobileNumber}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{payment.member?.mandal?.name || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{payment.member?.location?.name || '-'}</td>
            <td className="px-6 py-4 text-right">
              <div className="inline-flex items-center justify-end gap-0.5 text-sm font-bold text-blue-700">
                <IndianRupee className="w-3.5 h-3.5" />
                {Number(payment.amount || 0).toLocaleString('en-IN')}
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`text-xs font-bold uppercase ${getStatusColor(payment.status)}`}>
                {payment.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('en-IN') : '-'}
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => togglePaymentStatus(payment)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${payment.status === 'unpaid' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {payment.status === 'unpaid' ? <><CheckCircle className="w-3.5 h-3.5" /> Mark Paid</> : <><XCircle className="w-3.5 h-3.5" /> Mark Unpaid</>}
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      {pagination.totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Showing <span className="font-bold">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-bold">{Math.min(filters.page * filters.limit, pagination.totalData)}</span> of <span className="font-bold">{pagination.totalData}</span>
          </p>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button disabled={pagination.currentPage === 1} onClick={() => handlePageChange(pagination.currentPage - 1)} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition">Prev</button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const p = i + 1;
                if (pagination.totalPages > 5 && (p < pagination.currentPage - 1 || p > pagination.currentPage + 1) && p !== 1 && p !== pagination.totalPages) {
                  if (p === pagination.currentPage - 2 || p === pagination.currentPage + 2) return <span key={p} className="text-gray-400">...</span>;
                  return null;
                }
                return <button key={p} onClick={() => handlePageChange(p)} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-bold transition ${pagination.currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>;
              })}
            </div>
            <button disabled={pagination.currentPage === pagination.totalPages} onClick={() => handlePageChange(pagination.currentPage + 1)} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MandalPaymentPage;
