import { useEffect, useMemo, useState } from 'react';
import { Edit, IndianRupee, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import { useUpdateDonationMutation } from '../../../../services/donationApi';

const EditPartialPaymentModal = ({ isOpen, onClose, donation }) => {
  const [updateDonation, { isLoading }] = useUpdateDonationMutation();
  const [remainingAmountInput, setRemainingAmountInput] = useState('');

  useEffect(() => {
    if (!donation) return;
    const currentRemaining = Number(donation.remainingAmount || 0);
    setRemainingAmountInput(currentRemaining ? currentRemaining.toLocaleString('en-IN') : '');
  }, [donation]);

  const totalAmount = Number(donation?.amount || 0);
  const minimumPaidAmount = useMemo(() => Math.ceil(totalAmount * 0.2), [totalAmount]);
  const numericRemainingAmount = Number((remainingAmountInput || '').toString().replace(/,/g, '')) || 0;
  const paidAmount = totalAmount - numericRemainingAmount;

  const handleRemainingAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '' || /^\d+$/.test(rawValue)) {
      setRemainingAmountInput(rawValue === '' ? '' : Number(rawValue).toLocaleString('en-IN'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (remainingAmountInput === '') {
      toast.error('Please enter remaining amount');
      return;
    }

    if (numericRemainingAmount < 0) {
      toast.error('Remaining amount cannot be negative');
      return;
    }

    if (numericRemainingAmount >= totalAmount) {
      toast.error('Remaining amount must be less than total donation amount');
      return;
    }

    if (paidAmount < minimumPaidAmount) {
      toast.error(`Paid amount must be at least 20% (minimum ₹${minimumPaidAmount.toLocaleString('en-IN')})`);
      return;
    }

    try {
      await updateDonation({
        id: donation.id,
        paymentMode: 'partially_paid',
        status: 'partially_paid',
        remainingAmount: numericRemainingAmount
      }).unwrap();

      toast.success('Partial payment updated successfully');
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update partial payment');
    }
  };

  if (!donation) return null;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Partial Payment"
      icon={<Edit />}
      maxWidth="max-w-lg"
      showLanguageToggle={false}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
          <p className="text-xs text-gray-500">Donor</p>
          <p className="text-sm font-semibold text-gray-800">{donation.donor?.name || 'Anonymous'}</p>
          <p className="text-xs text-gray-500">Total Donation</p>
          <p className="text-lg font-bold text-blue-700">₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <IndianRupee className="w-4 h-4" /> Remaining Amount (INR)
          </label>
          <input
            type="text"
            value={remainingAmountInput}
            onChange={handleRemainingAmountChange}
            placeholder="0"
            required
            className="w-full px-4 py-3 text-lg font-bold border border-green-300 bg-green-50 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
          />
          <p className="text-xs text-gray-500">
            Enter remaining amount directly. Paid amount auto calculated.
          </p>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
          <span className="text-sm font-semibold text-orange-700">Calculated Paid Amount</span>
          <span className="text-lg font-bold text-orange-600">₹{Math.max(paidAmount, 0).toLocaleString('en-IN')}</span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default EditPartialPaymentModal;
