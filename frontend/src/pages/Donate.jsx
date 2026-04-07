import React, { useState, useEffect } from 'react';
import { 
  useCreateOrderMutation, 
  useVerifyPaymentMutation, 
  useGetUserByMobileQuery,
  useGetCitiesQuery,
  useGetSubLocationsQuery,
  useGetCategoriesQuery
} from '../services/apiSlice';
import { IndianRupee, User, Mail, Home as HomeIcon, Building, MapPin, Loader2, Phone, CreditCard, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

const Donate = () => {
  const navigate = useNavigate();

  const fireFireworks = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };
  const [formData, setFormData] = useState({
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
    paymentMode: 'online',
  });

  // Fetch Master Data
  const { data: citiesData } = useGetCitiesQuery();
  const { data: talukasData } = useGetSubLocationsQuery(formData.cityId, { skip: !formData.cityId });
  const { data: villagesData } = useGetSubLocationsQuery(formData.talukaId, { skip: !formData.talukaId });
  const { data: categoriesData } = useGetCategoriesQuery();

  const cities = citiesData?.data || [];
  const talukas = talukasData?.data || [];
  const villages = villagesData?.data || [];
  const categories = categoriesData?.data || [];

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

    // Handle dependent location selects
    if (name === 'cityId') {
      setFormData(prev => ({ ...prev, cityId: value, talukaId: '', villageId: '' }));
      return;
    }
    if (name === 'talukaId') {
      setFormData(prev => ({ ...prev, talukaId: value, villageId: '' }));
      return;
    }

    // Format donation amount with commas (Indian Style)
    if (name === 'amount') {
      // Remove commas for calculation
      const rawValue = value.replace(/,/g, '');
      if (rawValue === '' || /^\d+$/.test(rawValue)) {
        // Format with commas for display
        const formattedValue = rawValue === '' ? '' : Number(rawValue).toLocaleString('en-IN');
        setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      }
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

    // Get raw amount without commas for calculation
    const rawAmount = formData.amount.toString().replace(/,/g, '');
    if (!rawAmount || Number(rawAmount) <= 0) {
      toast.warning('Please enter a valid donation amount');
      return;
    }

    try {
      // 1. Create order on backend with numeric amount
      const response = await createOrder({ 
        ...formData, 
        amount: Number(rawAmount) 
      }).unwrap();

      if (formData.paymentMode === 'cash' || formData.paymentMode === 'pay_later') {
        const msg = formData.paymentMode === 'cash' 
          ? 'Donation Recorded Successfully!' 
          : 'Donation Intent Recorded! We will contact you for payment.';
        toast.success(msg);
        fireFireworks();
        setTimeout(() => {
          navigate('/');
        }, 5000);
        return;
      }

      const order = response.data.order;
      const donationId = response.data.donationId;
      const razorpay_key_id = response.data.razorpay_key_id;

      // 2. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Check your connection.');
        return;
      }

      // 3. Configure Razorpay
      const options = {
        key: razorpay_key_id,
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
            fireFireworks();
            setTimeout(() => {
              navigate('/');
            }, 5000); // Redirect after fireworks
          } catch (err) {
            console.error('Verification error:', err);
            const errorMsg = err?.data?.message || 'Payment verification failed. Please contact support.';
            toast.error(errorMsg);
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
      const errorMsg = err?.data?.message || 'Failed to initiate payment. Please try again.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden my-4">
        <div className="bg-blue-600 p-4 sm:p-6 text-white text-center">
          <h1 className="text-xl sm:text-2xl font-bold">Support Our Cause</h1>
          <p className="text-sm opacity-90">Your contribution makes a difference in our community</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* User Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider border-b border-blue-50 pb-2">
              <User className="w-4 h-4" /> User Details
            </div>
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="9876543210"
                  />
                  {isCheckingUser && (
                    <div className="absolute right-3 top-3">
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter Village Name"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter District Name"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Business/Org name"
                />
              </div>
            </div>
          </div>

          {/* Donation Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider border-b border-blue-50 pb-2">
              <IndianRupee className="w-4 h-4" /> Donation Details
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* City Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> City
                </label>
                <select
                  required
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition"
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Taluka Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Taluka
                </label>
                <select
                  name="talukaId"
                  value={formData.talukaId}
                  onChange={handleInputChange}
                  disabled={!formData.cityId}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Select Taluka</option>
                  {talukas.map(taluka => (
                    <option key={taluka.id} value={taluka.id}>{taluka.name}</option>
                  ))}
                </select>
              </div>

              {/* Village Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Village
                </label>
                <select
                  name="villageId"
                  value={formData.villageId}
                  onChange={handleInputChange}
                  disabled={!formData.talukaId}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Select Village</option>
                  {villages.map(village => (
                    <option key={village.id} value={village.id}>{village.name}</option>
                  ))}
                </select>
              </div>

              {/* Category Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Category
                </label>
                <select
                  required
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Reference Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" /> Reference Name
                </label>
                <input
                  name="referenceName"
                  value={formData.referenceName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter reference person name"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Mode
              </label>
              <div className="flex flex-wrap gap-4">
                <label className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.paymentMode === 'online' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-200'
                }`}>
                  <input
                    type="radio"
                    name="paymentMode"
                    value="online"
                    checked={formData.paymentMode === 'online'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className={`font-bold text-xs sm:text-sm ${formData.paymentMode === 'online' ? 'text-blue-700' : 'text-gray-500'}`}>Online</span>
                </label>
                <label className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.paymentMode === 'cash' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-200'
                }`}>
                  <input
                    type="radio"
                    name="paymentMode"
                    value="cash"
                    checked={formData.paymentMode === 'cash'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className={`font-bold text-xs sm:text-sm ${formData.paymentMode === 'cash' ? 'text-blue-700' : 'text-gray-500'}`}>Cash</span>
                </label>
                <label className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.paymentMode === 'pay_later' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-200'
                }`}>
                  <input
                    type="radio"
                    name="paymentMode"
                    value="pay_later"
                    checked={formData.paymentMode === 'pay_later'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className={`font-bold text-xs sm:text-sm ${formData.paymentMode === 'pay_later' ? 'text-blue-700' : 'text-gray-500'}`}>Pay Later</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" /> Donation Amount (INR)
              </label>
              <input
                required
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-2xl font-bold border border-blue-300 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreatingOrder || isVerifying}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-200 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
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
