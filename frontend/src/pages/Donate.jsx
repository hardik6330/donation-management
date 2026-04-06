import React, { useState, useEffect } from 'react';
import { useCreateOrderMutation, useVerifyPaymentMutation, useGetUserByMobileQuery } from '../services/apiSlice';
import { IndianRupee, User, Mail, Home as HomeIcon, Building, MapPin, Loader2, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Donate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mobileNumber: '',
    name: '',
    email: '',
    address: '',
    village: '',
    district: '',
    companyName: '',
    amount: '',
    cause: 'General Community Support',
  });

  // Fetch user data if mobile number is 10 digits
  const { data: existingUser, isFetching: isCheckingUser } = useGetUserByMobileQuery(formData.mobileNumber, {
    skip: formData.mobileNumber.length !== 10,
  });

  // Auto-fill form when user is found
  useEffect(() => {
    if (existingUser?.success && existingUser.data) {
      const user = existingUser.data;
      const timer = setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          address: user.address || '',
          village: user.village || '',
          district: user.district || '',
          companyName: user.companyName || '',
        }));
      }, 0);
      toast.info('User found! Details auto-filled.');
      return () => clearTimeout(timer);
    }
  }, [existingUser]);

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Limit mobile number to 10 digits and allow only numbers
    if (name === 'mobileNumber') {
      const cleaned = value.replace(/\D/g, ''); // Remove non-digits
      if (cleaned.length > 10) return; // Prevent more than 10 digits
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      toast.warning('Please enter a valid donation amount');
      return;
    }

    try {
      // 1. Create order on backend
      const response = await createOrder(formData).unwrap();
      const order = response.data.order;
      const donationId = response.data.donationId;

      // 2. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Check your connection.');
        return;
      }

      // 3. Configure Razorpay
      const options = {
        key: 'rzp_test_Sa5VQ3LEmqXl4t', // Hardcoding for now, should ideally come from backend or env
        amount: order.amount,
        currency: order.currency,
        name: 'Donation Management System',
        description: formData.cause,
        order_id: order.id,
        handler: async (response) => {
          try {
            // 4. Verify payment on backend
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              donationId: donationId,
            }).unwrap();

            toast.success('Donation Successful! Thank you for your support.');
            navigate('/');
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
        },
        theme: {
          color: '#2563eb',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Order creation error:', err);
      toast.error('Failed to initiate payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden my-4">
        <div className="bg-blue-600 p-4 sm:p-6 text-white text-center">
          <h1 className="text-xl sm:text-2xl font-bold">Support Our Cause</h1>
          <p className="text-sm opacity-90">Your contribution makes a difference in our community</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Mobile Number
              </label>
              <div className="relative">
                <input
                  required
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="9876543210"
                />
                {isCheckingUser && (
                  <div className="absolute right-3 top-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <HomeIcon className="w-4 h-4" /> Address
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Street name, house no."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Village
              </label>
              <input
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your village"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> District
              </label>
              <input
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your district"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Building className="w-4 h-4" /> Company Name (Optional)
              </label>
              <input
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Business/Org name"
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" /> Donation Amount (INR)
            </label>
            <input
              required
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-2xl font-bold border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <button
            type="submit"
            disabled={isCreatingOrder || isVerifying}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {(isCreatingOrder || isVerifying) ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : (
              'Contribute Now'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
