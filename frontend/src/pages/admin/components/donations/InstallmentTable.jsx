import React from 'react';
import { useGetDonationInstallmentsQuery } from '../../../../services/donationApi';
import { Loader2, IndianRupee, Calendar, CreditCard } from 'lucide-react';

const InstallmentTable = ({ donationId }) => {
  const { data: installments, isLoading } = useGetDonationInstallmentsQuery(donationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50/50 rounded-xl">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!installments?.data || installments.data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50/50 rounded-xl">
        No payment history found.
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 rounded-xl overflow-hidden border border-gray-100">
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-100/50">
        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Payment History</h4>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="px-6 py-3 font-semibold">Date</th>
            <th className="px-6 py-3 font-semibold">Mode</th>
            <th className="px-6 py-3 font-semibold">Amount</th>
            <th className="px-6 py-3 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {installments.data.map((inst) => (
            <tr key={inst.id} className="hover:bg-white transition-colors">
              <td className="px-6 py-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {new Date(inst.paymentDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </td>
              <td className="px-6 py-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                  <span className="capitalize text-gray-600 font-medium">{inst.paymentMode.replace('_', ' ')}</span>
                </div>
              </td>
              <td className="px-6 py-3">
                <div className="flex items-center gap-0.5 font-bold text-blue-700">
                  <IndianRupee className="w-3 h-3" />
                  {inst.amount.toLocaleString('en-IN')}
                </div>
              </td>
              <td className="px-6 py-3 text-gray-500 italic text-xs">
                {inst.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstallmentTable;
