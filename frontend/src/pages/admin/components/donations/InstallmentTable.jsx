import React from 'react';
import {
  useGetDonationInstallmentsQuery,
  useGenerateInstallmentSlipMutation,
} from '../../../../services/donationApi';
import { Loader2, IndianRupee, Calendar, CreditCard, FileText, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { handleMutationError } from '../../../../utils/errorHelper';

const InstallmentTable = ({ donationId }) => {
  const { data: installments, isLoading } = useGetDonationInstallmentsQuery(donationId);
  const [generateSlip, { isLoading: isGenerating, originalArgs }] = useGenerateInstallmentSlipMutation();

  const handleGenerate = async (installmentId) => {
    try {
      await generateSlip({ donationId, installmentId }).unwrap();
      toast.success('Installment slip generated');
    } catch (err) {
      handleMutationError(err, 'Failed to generate slip');
    }
  };

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
            <th className="px-6 py-3 font-semibold">Slip</th>
            <th className="px-6 py-3 font-semibold">Date</th>
            <th className="px-6 py-3 font-semibold">Mode</th>
            <th className="px-6 py-3 font-semibold">Amount</th>
            <th className="px-6 py-3 font-semibold">Notes</th>
            <th className="px-6 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {installments.data.map((inst) => {
            const busy = isGenerating && originalArgs?.installmentId === inst.id;
            return (
              <tr key={inst.id} className="hover:bg-white transition-colors">
                <td className="px-6 py-3">
                  <span className="font-semibold text-gray-700">{inst.slipNo || '-'}</span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {new Date(inst.paymentDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(inst.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
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
                <td className="px-6 py-3">
                  {inst.slipUrl ? (
                    <a
                      href={inst.slipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> View PDF
                    </a>
                  ) : (
                    <button
                      onClick={() => handleGenerate(inst.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-md transition-colors"
                    >
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                      {busy ? 'Generating…' : 'Generate PDF'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InstallmentTable;
