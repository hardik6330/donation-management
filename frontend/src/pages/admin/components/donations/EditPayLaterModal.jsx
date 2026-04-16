import { useState, useRef } from 'react';
import { CreditCard, Loader2, Edit, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import FormInput from '../../../../components/common/FormInput';
import { useUpdateDonationMutation } from '../../../../services/donationApi';

const EditPayLaterModal = ({ isOpen, onClose, donation }) => {
  const [updateDonation, { isLoading }] = useUpdateDonationMutation();
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentModeName, setPaymentModeName] = useState('Cash');
  const [status, setStatus] = useState('completed');
  const [statusName, setStatusName] = useState('Completed');
  const [paidAmount, setPaidAmount] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const paidAmountRef = useRef(null);

  const paymentModes = [
    { id: 'cash', name: 'Cash' },
    { id: 'online', name: 'Online' },
    { id: 'cheque', name: 'Cheque' }
  ];

  const statuses = [
    { id: 'completed', name: 'Completed' },
    { id: 'partially_paid', name: 'Partially Paid' }
  ];

  if (!donation) return null;

  const totalAmount = Number(donation.amount || 0);
  const minimumPaidAmount = Math.ceil(totalAmount * 0.2);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updateData = {
      id: donation.id,
      paymentMode,
      status,
      paymentDate: new Date().toISOString()
    };

    if (status === 'partially_paid') {
      const numericPaid = Number(String(paidAmount).replace(/,/g, ''));
      if (!paidAmount || numericPaid <= 0) {
        toast.error('Please enter paid amount');
        return;
      }
      if (numericPaid < minimumPaidAmount) {
        toast.error(`Paid amount must be at least 20% (minimum ₹${minimumPaidAmount.toLocaleString('en-IN')})`);
        return;
      }
      if (numericPaid >= totalAmount) {
        toast.error('Paid amount must be less than total donation for partial payment');
        return;
      }
      updateData.paidAmount = numericPaid;
    }

    try {
      await updateDonation(updateData).unwrap();
      toast.success('Payment updated successfully');
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update payment');
    }
  };

  const handlePaidAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '' || /^\d+$/.test(rawValue)) {
      setPaidAmount(rawValue === '' ? '' : Number(rawValue).toLocaleString('en-IN'));
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Pay Later Donation"
      icon={<Edit />}
      maxWidth="max-w-lg"
      showLanguageToggle={false}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
          <p className="text-xs text-gray-500">Donor</p>
          <p className="text-sm font-semibold text-gray-800">{donation.donor?.name || 'Anonymous'}</p>
          <p className="text-xs text-gray-500">Donation Amount</p>
          <p className="text-lg font-bold text-blue-700">₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SearchableDropdown
              label="Payment Mode"
              name="paymentModeName"
              placeholder="Select Mode"
              value={paymentModeName}
              items={paymentModes}
              onChange={(e) => {
                setPaymentModeName(e.target.value);
                setActiveDropdown('paymentModeName');
              }}
              onSelect={(id, name) => {
                setPaymentMode(id);
                setPaymentModeName(name);
                setActiveDropdown(null);
              }}
              isActive={activeDropdown === 'paymentModeName'}
              setActive={setActiveDropdown}
              required
              icon={CreditCard}
              allowTransliteration={false}
            />
            <SearchableDropdown
              label="Status"
              name="statusName"
              placeholder="Select Status"
              value={statusName}
              items={statuses}
              onChange={(e) => {
                setStatusName(e.target.value);
                setActiveDropdown('statusName');
              }}
              onSelect={(id, name) => {
                setStatus(id);
                setStatusName(name);
                setActiveDropdown(null);
                if (id === 'partially_paid') {
                  setTimeout(() => paidAmountRef.current?.focus(), 100);
                }
              }}
              isActive={activeDropdown === 'statusName'}
              setActive={setActiveDropdown}
              required
              icon={CreditCard}
              allowTransliteration={false}
            />
          </div>

          {status === 'partially_paid' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
              <FormInput
                label="Paid Amount"
                name="paidAmount"
                required
                placeholder="0"
                value={paidAmount}
                onChange={handlePaidAmountChange}
                inputRef={paidAmountRef}
                icon={IndianRupee}
              />
              {paidAmount && (() => {
                const paid = Number(String(paidAmount).replace(/,/g, ''));
                const remaining = totalAmount - paid;
                if (remaining > 0) {
                  return (
                    <div className="flex items-center justify-between px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <span className="text-xs font-semibold text-orange-700">Remaining Amount</span>
                      <span className="text-sm font-bold text-orange-600 flex items-center gap-0.5">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {remaining.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
              <p className="text-[10px] text-gray-500 italic">
                * Minimum 20% (₹{minimumPaidAmount.toLocaleString('en-IN')}) payment required for partial.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
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
            {isLoading ? 'Updating...' : 'Complete Payment'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default EditPayLaterModal;
