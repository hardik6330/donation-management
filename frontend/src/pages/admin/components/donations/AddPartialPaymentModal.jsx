import { useEffect, useRef, useState } from 'react';
import { IndianRupee, Loader2, PlusCircle, MessageSquare, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import { useUpdateDonationMutation } from '../../../../services/donationApi';

const AddPartialPaymentModal = ({ isOpen, onClose, donation, onUpdated }) => {
  const [updateDonation, { isLoading }] = useUpdateDonationMutation();
  const [addAmount, setAddAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentModeName, setPaymentModeName] = useState('Cash');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const paymentModeRef = useRef(null);
  const addAmountRef = useRef(null);
  const notesRef = useRef(null);
  const submitRef = useRef(null);

  const paymentModes = [
    { id: 'cash', name: 'Cash' },
    { id: 'online', name: 'Online' },
    { id: 'cheque', name: 'Cheque' }
  ];

  useEffect(() => {
    if (!isOpen) {
      setAddAmount('');
      setNotes('');
      setPaymentMode('cash');
      setPaymentModeName('Cash');
    } else {
      setTimeout(() => paymentModeRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e, nextRef, prevRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef === submitRef) {
        handleSubmit(e);
      } else if (nextRef?.current) {
        nextRef.current.focus();
      }
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && prevRef?.current) {
      if (e.target.selectionStart === 0 || e.target.selectionStart === undefined) {
        e.preventDefault();
        prevRef.current.focus();
      }
    } else if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && nextRef?.current) {
      if (e.target.selectionStart === e.target.value.length || e.target.selectionStart === undefined) {
        e.preventDefault();
        nextRef.current.focus();
      }
    }
  };

  if (!donation) return null;

  const totalAmount = Number(donation.amount || 0);
  const currentPaidAmount = Number(donation.paidAmount || 0);
  const currentRemainingAmount = Number(donation.remainingAmount || 0);
  const numericAddAmount = Number((addAmount || '').replace(/,/g, '')) || 0;
  const updatedPaidAmount = currentPaidAmount + numericAddAmount;
  const updatedRemainingAmount = totalAmount - updatedPaidAmount;

  const handleAddAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '' || /^\d+$/.test(rawValue)) {
      setAddAmount(rawValue === '' ? '' : Number(rawValue).toLocaleString('en-IN'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!numericAddAmount || numericAddAmount <= 0) {
      toast.error('Please enter add payment amount');
      return;
    }

    if (numericAddAmount > currentRemainingAmount) {
      toast.error('Add amount cannot be greater than remaining amount');
      return;
    }

    try {
      const result = await updateDonation({
        id: donation.id,
        paymentMode: paymentMode,
        remainingAmount: updatedRemainingAmount,
        notes: notes
      }).unwrap();

      if (typeof onUpdated === 'function') onUpdated(result);
      toast.success('Partial payment added successfully');
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add partial payment');
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Partial Payment"
      icon={<PlusCircle />}
      maxWidth="max-w-lg"
      showLanguageToggle={true}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
          <p className="text-xs text-gray-500">Donor</p>
          <p className="text-sm font-semibold text-gray-800">{donation.donor?.name || 'Anonymous'}</p>
          <p className="text-xs text-gray-500">Total Donation</p>
          <p className="text-lg font-bold text-blue-700">₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-green-200 bg-green-50 p-3">
            <p className="text-xs text-green-700 font-semibold">Current Paid</p>
            <p className="text-base font-bold text-green-700">₹{currentPaidAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
            <p className="text-xs text-orange-700 font-semibold">Current Remaining</p>
            <p className="text-base font-bold text-orange-700">₹{currentRemainingAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="space-y-4">
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
              setTimeout(() => addAmountRef.current?.focus(), 100);
            }}
            isActive={activeDropdown === 'paymentModeName'}
            setActive={setActiveDropdown}
            required
            icon={CreditCard}
            allowTransliteration={false}
            inputRef={paymentModeRef}
            onKeyDown={(e) => handleKeyDown(e, addAmountRef, null)}
          />

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" /> Add Payment Amount (INR)
            </label>
            <input
              type="text"
              value={addAmount}
              onChange={handleAddAmountChange}
              required
              placeholder="0"
              ref={addAmountRef}
              onKeyDown={(e) => handleKeyDown(e, notesRef, paymentModeRef)}
              className="w-full px-4 py-3 text-lg font-bold border border-emerald-300 bg-emerald-50 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormInput
            label="Notes / Remark"
            name="notes"
            placeholder="Add some notes about this payment..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            icon={MessageSquare}
            inputRef={notesRef}
            onKeyDown={(e) => handleKeyDown(e, submitRef, addAmountRef)}
          />
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-1">
          <p className="text-xs text-blue-700 font-semibold">After Update</p>
          <p className="text-sm text-blue-800">
            Paid: <span className="font-bold">₹{Math.max(updatedPaidAmount, 0).toLocaleString('en-IN')}</span>
          </p>
          <p className="text-sm text-blue-800">
            Remaining: <span className="font-bold">₹{Math.max(updatedRemainingAmount, 0).toLocaleString('en-IN')}</span>
          </p>
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
            ref={submitRef}
            type="submit"
            disabled={isLoading}
            onKeyDown={(e) => handleKeyDown(e, null, notesRef)}
            className="flex-1 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLoading ? 'Updating...' : 'Add Payment'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddPartialPaymentModal;
