import { useState } from 'react';
import { CreditCard, Loader2, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import { useUpdateDonationMutation } from '../../../../services/donationApi';

const EditPayLaterModal = ({ isOpen, onClose, donation }) => {
  const [updateDonation, { isLoading }] = useUpdateDonationMutation();
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentModeName, setPaymentModeName] = useState('Cash');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const paymentModes = [
    { id: 'cash', name: 'Cash' },
    { id: 'online', name: 'Online' },
    { id: 'cheque', name: 'Cheque' }
  ];

  if (!donation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateDonation({
        id: donation.id,
        paymentMode,
        status: 'completed',
        paymentDate: new Date().toISOString()
      }).unwrap();

      toast.success('Payment updated successfully');
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update payment');
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
          <p className="text-lg font-bold text-blue-700">₹{Number(donation.amount || 0).toLocaleString('en-IN')}</p>
        </div>

        <div className="space-y-2">
          <SearchableDropdown
            label="Actual Payment Mode"
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
            {isLoading ? 'Updating...' : 'Complete Payment'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default EditPayLaterModal;
