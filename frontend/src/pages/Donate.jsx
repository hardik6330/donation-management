import React, { useState, useEffect, useRef } from 'react';
import {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetUserByMobileQuery,
  useGetCitiesQuery,
  useGetSubLocationsQuery,
  useGetCategoriesQuery,
  useGetGaushalasQuery,
  useGetKathasQuery
} from '../services/apiSlice';
import { IndianRupee, User, Mail, Home as HomeIcon, Building, MapPin, Loader2, Phone, CreditCard, Tag, Mic2, Building2, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

// Reusable dropdown for Donate page
const DonateDropdown = ({ label, icon: Icon, value, items = [], placeholder, onChange, onClear, disabled = false, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);

  const selectedItem = items.find(i => i.id === value);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightIndex(-1);
    setSearch('');
  }, [isOpen]);

  useEffect(() => {
    if (listRef.current && highlightIndex >= 0) {
      const el = listRef.current.children[highlightIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (item) => {
    onChange(item.id);
    setIsOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!disabled) setIsOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && filtered[highlightIndex]) handleSelect(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-2" ref={ref}>
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />} {label}
      </label>
      <div
        tabIndex={0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm cursor-pointer flex items-center justify-between transition
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}
        `}
      >
        <span className={selectedItem ? 'text-gray-800' : 'text-gray-400'}>
          {selectedItem?.name || placeholder}
        </span>
        <div className="flex items-center gap-1 text-gray-400">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="hover:text-red-500 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[120] mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={{ width: ref.current?.offsetWidth }}>
          {items.length > 5 && (
            <div className="p-2 border-b border-gray-50">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
          <div ref={listRef} className="max-h-48 overflow-y-auto custom-scrollbar">
            {filtered.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0
                  ${index === highlightIndex ? 'bg-blue-50 text-blue-600' : ''}
                  ${index !== highlightIndex && value === item.id ? 'bg-blue-50/50 text-blue-600' : ''}
                  ${index !== highlightIndex && value !== item.id ? 'text-gray-700 hover:bg-blue-50' : ''}
                `}
              >
                {item.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">No options</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Donate = () => {
  const navigate = useNavigate();

  const fireFireworks = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const [formData, setFormData] = useState({
    mobileNumber: '', name: '', email: '', address: '', village: '', district: '',
    cityId: '', talukaId: '', villageId: '', categoryId: '', gaushalaId: '', kathaId: '',
    companyName: '', referenceName: '', amount: '', paymentMode: 'online',
  });

  const { data: citiesData } = useGetCitiesQuery();
  const { data: talukasData } = useGetSubLocationsQuery(formData.cityId, { skip: !formData.cityId });
  const { data: villagesData } = useGetSubLocationsQuery(formData.talukaId, { skip: !formData.talukaId });
  const { data: categoriesData } = useGetCategoriesQuery();

  const filterLocationId = formData.villageId || formData.talukaId || formData.cityId;

  const { data: gaushalasData, isFetching: isFetchingGaushalas } = useGetGaushalasQuery(
    { locationId: filterLocationId, fetchAll: 'true' }, { skip: !filterLocationId }
  );
  const { data: kathasData, isFetching: isFetchingKathas } = useGetKathasQuery(
    { locationId: filterLocationId, fetchAll: 'true' }, { skip: !filterLocationId }
  );

  const cities = citiesData?.data || [];
  const talukas = talukasData?.data || [];
  const villages = villagesData?.data || [];
  const categories = categoriesData?.data || [];
  const gaushalas = gaushalasData?.data?.rows || [];
  const kathas = kathasData?.data?.rows || [];

  const { data: existingUser, isFetching: isCheckingUser } = useGetUserByMobileQuery(formData.mobileNumber, {
    skip: formData.mobileNumber.length !== 10,
  });

  useEffect(() => {
    if (existingUser?.success && existingUser.data) {
      const user = existingUser.data;
      const timer = setTimeout(() => {
        setFormData(prev => ({
          ...prev, name: user.name || '', email: user.email || '', address: user.address || '',
          village: user.village || '', district: user.district || '', cityId: user.cityId || '',
          talukaId: user.talukaId || '', villageId: user.villageId || '', companyName: user.companyName || '',
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
    if (name === 'mobileNumber') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 10) return;
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }
    if (name === 'amount') {
      const rawValue = value.replace(/,/g, '');
      if (rawValue === '' || /^\d+$/.test(rawValue)) {
        const formattedValue = rawValue === '' ? '' : Number(rawValue).toLocaleString('en-IN');
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
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
    const rawAmount = formData.amount.toString().replace(/,/g, '');
    if (!rawAmount || Number(rawAmount) <= 0) {
      toast.warning('Please enter a valid donation amount');
      return;
    }
    try {
      const response = await createOrder({ ...formData, amount: Number(rawAmount) }).unwrap();
      if (formData.paymentMode === 'cash' || formData.paymentMode === 'pay_later') {
        const msg = formData.paymentMode === 'cash'
          ? 'Donation Recorded Successfully!'
          : 'Donation Intent Recorded! We will contact you for payment.';
        toast.success(msg);
        fireFireworks();
        setTimeout(() => navigate('/'), 5000);
        return;
      }
      const order = response.data.order;
      const donationId = response.data.donationId;
      const razorpay_key_id = response.data.razorpay_key_id;
      const res = await loadRazorpayScript();
      if (!res) { toast.error('Razorpay SDK failed to load.'); return; }
      const options = {
        key: razorpay_key_id, amount: order.amount, currency: order.currency,
        name: 'Donation Management System', description: formData.cause, order_id: order.id,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              donationId,
            }).unwrap();
            toast.success('Donation Successful! Thank you for your support.');
            fireFireworks();
            setTimeout(() => navigate('/'), 5000);
          } catch (err) {
            toast.error(err?.data?.message || 'Payment verification failed.');
          }
        },
        prefill: { name: formData.name, email: formData.email },
        theme: { color: '#2563eb' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to initiate payment.');
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
                  <input required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="9876543210" />
                  {isCheckingUser && <div className="absolute right-3 top-3"><Loader2 className="w-4 h-4 animate-spin text-blue-600" /></div>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User className="w-4 h-4" /> Full Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><HomeIcon className="w-4 h-4" /> Address</label>
                <input name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Street name, house no." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4" /> Village</label>
                <input name="village" value={formData.village} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter Village Name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4" /> District</label>
                <input name="district" value={formData.district} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter District Name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Building className="w-4 h-4" /> Company Name (Optional)</label>
                <input name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Business/Org name" />
              </div>
            </div>
          </div>

          {/* Donation Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider border-b border-blue-50 pb-2">
              <IndianRupee className="w-4 h-4" /> Donation Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <DonateDropdown label="City" icon={MapPin} value={formData.cityId} items={cities} placeholder="Select City" required
                onChange={(id) => setFormData(prev => ({ ...prev, cityId: id, talukaId: '', villageId: '', gaushalaId: '', kathaId: '' }))}
                onClear={() => setFormData(prev => ({ ...prev, cityId: '', talukaId: '', villageId: '', gaushalaId: '', kathaId: '' }))}
              />
              <DonateDropdown label="Taluka" icon={MapPin} value={formData.talukaId} items={talukas} placeholder="Select Taluka" disabled={!formData.cityId}
                onChange={(id) => setFormData(prev => ({ ...prev, talukaId: id, villageId: '', gaushalaId: '', kathaId: '' }))}
                onClear={() => setFormData(prev => ({ ...prev, talukaId: '', villageId: '', gaushalaId: '', kathaId: '' }))}
              />
              <DonateDropdown label="Village" icon={MapPin} value={formData.villageId} items={villages} placeholder="Select Village" disabled={!formData.talukaId}
                onChange={(id) => setFormData(prev => ({ ...prev, villageId: id, gaushalaId: '', kathaId: '' }))}
                onClear={() => setFormData(prev => ({ ...prev, villageId: '', gaushalaId: '', kathaId: '' }))}
              />
              <DonateDropdown label="Category" icon={Tag} value={formData.categoryId} items={categories} placeholder="Select Category" required
                onChange={(id) => setFormData(prev => ({ ...prev, categoryId: id }))}
                onClear={() => setFormData(prev => ({ ...prev, categoryId: '' }))}
              />
              <DonateDropdown label="Gaushala" icon={Building2} value={formData.gaushalaId} items={gaushalas}
                placeholder={isFetchingGaushalas ? 'Loading...' : !filterLocationId ? 'Select Location First' : gaushalas.length === 0 ? 'No Gaushalas' : 'Select Gaushala (Optional)'}
                disabled={!!formData.kathaId || !filterLocationId || isFetchingGaushalas || gaushalas.length === 0}
                onChange={(id) => setFormData(prev => ({ ...prev, gaushalaId: id }))}
                onClear={() => setFormData(prev => ({ ...prev, gaushalaId: '' }))}
              />
              <DonateDropdown label="Active Katha" icon={Mic2} value={formData.kathaId} items={kathas}
                placeholder={isFetchingKathas ? 'Loading...' : !filterLocationId ? 'Select Location First' : kathas.length === 0 ? 'No Kathas' : 'Select Katha (Optional)'}
                disabled={!!formData.gaushalaId || !filterLocationId || isFetchingKathas || kathas.length === 0}
                onChange={(id) => setFormData(prev => ({ ...prev, kathaId: id }))}
                onClear={() => setFormData(prev => ({ ...prev, kathaId: '' }))}
              />
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User className="w-4 h-4" /> Reference Name</label>
                <input name="referenceName" value={formData.referenceName} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter reference person name" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Mode
              </label>
              <div className="flex flex-wrap gap-4">
                {[{ value: 'online', label: 'Online' }, { value: 'cash', label: 'Cash' }, { value: 'pay_later', label: 'Pay Later' }].map(mode => (
                  <label key={mode.value} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.paymentMode === mode.value ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-200'
                  }`}>
                    <input type="radio" name="paymentMode" value={mode.value} checked={formData.paymentMode === mode.value} onChange={handleInputChange} className="hidden" />
                    <span className={`font-bold text-xs sm:text-sm ${formData.paymentMode === mode.value ? 'text-blue-700' : 'text-gray-500'}`}>{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" /> Donation Amount (INR)
              </label>
              <input required type="text" name="amount" value={formData.amount} onChange={handleInputChange}
                className="w-full px-4 py-3 text-2xl font-bold border border-blue-300 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="0" />
            </div>
          </div>

          <button type="submit" disabled={isCreatingOrder || isVerifying}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-200 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50">
            {(isCreatingOrder || isVerifying) ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : 'Contribute Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
