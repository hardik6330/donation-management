import React, { useState, useEffect, useRef } from 'react';
import {
  useCreateOrderMutation,
  // useVerifyPaymentMutation, // Razorpay commented out
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
const DonateDropdown = ({ label, icon: Icon, value, items = [], placeholder, onChange, onClear, disabled = false, onDisabledClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  const listRef = useRef(null);

  const selectedItem = items.find(i => i.id === value);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      if (ref.current) setWidth(ref.current.offsetWidth);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  const filtered = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (!isOpen) return;
    setHighlightIndex(filtered.length > 0 ? 0 : -1);
  }, [isOpen, query, items.length]);

  useEffect(() => {
    if (!isOpen || highlightIndex < 0 || !listRef.current) return;
    const activeOption = listRef.current.querySelector(`[data-index="${highlightIndex}"]`);
    if (activeOption) {
      activeOption.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex, isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setQuery('');
      setHighlightIndex(-1);
    } else if (onDisabledClick) {
      onDisabledClick();
    }
  };

  const handleSelect = (item) => {
    onChange(item.id);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!disabled) {
          setIsOpen(true);
          setQuery('');
          setHighlightIndex(-1);
        }
      } else if (e.key.length === 1 && !disabled) {
        e.preventDefault();
        setIsOpen(true);
        setQuery(e.key);
        setHighlightIndex(0);
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
      if (filtered.length === 0) return;
      const selectedIndex = highlightIndex >= 0 ? highlightIndex : 0;
      handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="space-y-2" ref={ref}>
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />} {label}
      </label>
      <div
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm cursor-pointer flex items-center justify-between transition
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}
        `}
      >
        {isOpen ? (
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightIndex(0);
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder={selectedItem?.name || placeholder}
            className="w-full bg-transparent text-gray-800 placeholder:text-gray-400 outline-none"
          />
        ) : (
          <span className={selectedItem ? 'text-gray-800' : 'text-gray-400'}>
            {selectedItem?.name || placeholder}
          </span>
        )}
        <div className="flex items-center gap-1 text-gray-400">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                setQuery('');
              }}
              className="hover:text-red-500 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-120 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={{ width }}>
          <div ref={listRef} className="max-h-48 overflow-y-auto custom-scrollbar">
            {filtered.map((item, index) => (
              <button
                key={item.id}
                data-index={index}
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

  // Refs for Fast Entry
  const mobileRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const addressRef = useRef(null);
  const villageRef = useRef(null);
  const districtRef = useRef(null);
  const companyRef = useRef(null);
  const referenceRef = useRef(null);
  const amountRef = useRef(null);
  const paidAmountRef = useRef(null);
  const submitRef = useRef(null);

  const [formData, setFormData] = useState({
    mobileNumber: '', name: '', email: '', address: '', village: '', district: '',
    cityId: '', talukaId: '', villageId: '', categoryId: '', gaushalaId: '', kathaId: '',
    companyName: '', referenceName: '', amount: '', paymentMode: 'online', paidAmount: '',
  });

  // Fast Entry: Focus first field on mount
  useEffect(() => {
    if (mobileRef.current) mobileRef.current.focus();
  }, []);

  const { data: categoriesData } = useGetCategoriesQuery({ fetchAll: true });
  const { data: citiesData } = useGetCitiesQuery({ fetchAll: true });
  const { data: talukasData } = useGetSubLocationsQuery({ parentId: formData.cityId, fetchAll: true }, { skip: !formData.cityId });
  const { data: villagesData } = useGetSubLocationsQuery({ parentId: formData.talukaId, fetchAll: true }, { skip: !formData.talukaId });

  const filterLocationId = formData.villageId || formData.talukaId || formData.cityId;

  const { data: gaushalasData, isFetching: isFetchingGaushalas } = useGetGaushalasQuery(
    { locationId: filterLocationId, fetchAll: 'true' }, { skip: !filterLocationId }
  );
  const { data: kathasData, isFetching: isFetchingKathas } = useGetKathasQuery(
    { locationId: filterLocationId, status: 'active', fetchAll: 'true' }, { skip: !filterLocationId }
  );

  const cities = citiesData?.data?.data || [];
  const talukas = talukasData?.data?.data || [];
  const villages = villagesData?.data?.data || [];
  const categories = categoriesData?.data?.data || [];
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
  // const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation(); // Razorpay commented out

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 10) return;
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      return;
    }
    if (name === 'amount' || name === 'paidAmount') {
      const rawValue = value.replace(/,/g, '');
      if (rawValue === '' || /^\d+$/.test(rawValue)) {
        const formattedValue = rawValue === '' ? '' : Number(rawValue).toLocaleString('en-IN');
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }
    if (name === 'paymentMode') {
      setFormData(prev => ({ ...prev, paymentMode: value, paidAmount: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  // --- Razorpay script loader (commented out) ---
  // const loadRazorpayScript = () => {
  //   return new Promise((resolve) => {
  //     const script = document.createElement('script');
  //     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  //     script.onload = () => resolve(true);
  //     script.onerror = () => resolve(false);
  //     document.body.appendChild(script);
  //   });
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawAmount = formData.amount.toString().replace(/,/g, '');
    const totalAmount = Number(rawAmount);
    if (!rawAmount || totalAmount <= 0) {
      toast.warning('Please enter a valid donation amount');
      return;
    }
    if (!formData.categoryId && !formData.gaushalaId && !formData.kathaId) {
      toast.warning('Please select at least one: Category, Gaushala, or Active Katha');
      return;
    }
    if (formData.paymentMode === 'partially_paid') {
      const rawPaid = formData.paidAmount.toString().replace(/,/g, '');
      const paidAmount = Number(rawPaid);
      const minimumPaidAmount = Math.ceil(totalAmount * 0.2);
      if (!rawPaid || paidAmount <= 0) {
        toast.warning('Please enter the paid amount');
        return;
      }
      if (paidAmount < minimumPaidAmount) {
        toast.warning(`Paid amount must be at least 20% of total donation (minimum ₹${minimumPaidAmount.toLocaleString('en-IN')})`);
        return;
      }
      if (paidAmount === totalAmount) {
        toast.warning('This is partial payment. Paid amount must be less than total amount.');
        return;
      }
      if (paidAmount > totalAmount) {
        toast.warning('Paid amount cannot be greater than total donation amount');
        return;
      }
    }

    try {
      const rawPaid = formData.paidAmount.toString().replace(/,/g, '');
      await createOrder({
        ...formData,
        amount: Number(rawAmount),
        paidAmount: formData.paymentMode === 'partially_paid' ? Number(rawPaid) : undefined,
      }).unwrap();
      const msg = formData.paymentMode === 'pay_later'
        ? 'Donation Intent Recorded! We will contact you for payment.'
        : formData.paymentMode === 'partially_paid'
          ? 'Partial Donation Recorded Successfully!'
          : 'Donation Recorded Successfully!';
      toast.success(msg);
      fireFireworks();
      setTimeout(() => navigate('/'), 5000);

      // --- Razorpay checkout flow (commented out) ---
      // if (formData.paymentMode === 'online') {
      //   const order = response.data.order;
      //   const donationId = response.data.donationId;
      //   const razorpay_key_id = response.data.razorpay_key_id;
      //   const res = await loadRazorpayScript();
      //   if (!res) { toast.error('Razorpay SDK failed to load.'); return; }
      //   const options = {
      //     key: razorpay_key_id, amount: order.amount, currency: order.currency,
      //     name: 'Donation Management System', description: formData.cause, order_id: order.id,
      //     handler: async (response) => {
      //       try {
      //         await verifyPayment({
      //           razorpay_order_id: response.razorpay_order_id,
      //           razorpay_payment_id: response.razorpay_payment_id,
      //           razorpay_signature: response.razorpay_signature,
      //           donationId,
      //         }).unwrap();
      //         toast.success('Donation Successful! Thank you for your support.');
      //         fireFireworks();
      //         setTimeout(() => navigate('/'), 5000);
      //       } catch (err) {
      //         toast.error(err?.data?.message || 'Payment verification failed.');
      //       }
      //     },
      //     prefill: { name: formData.name, email: formData.email },
      //     theme: { color: '#2563eb' },
      //   };
      //   const rzp = new window.Razorpay(options);
      //   rzp.open();
      // }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to record donation.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden my-4">
        <div className="bg-blue-600 p-4 sm:p-6 text-white text-center">
          <h1 className="text-xl sm:text-2xl font-bold">Support Shree Sarveshwar Gaudham</h1>
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
                  <input ref={mobileRef} required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, nameRef)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="9876543210" />
                  {isCheckingUser && <div className="absolute right-3 top-3"><Loader2 className="w-4 h-4 animate-spin text-blue-600" /></div>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User className="w-4 h-4" /> Full Name</label>
                <input ref={nameRef} required name="name" value={formData.name} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, emailRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Address</label>
                <input ref={emailRef} required type="email" name="email" value={formData.email} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, addressRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><HomeIcon className="w-4 h-4" /> Address</label>
                <input ref={addressRef} name="address" value={formData.address} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, villageRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Street name, house no." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4" /> Village</label>
                <input ref={villageRef} name="village" value={formData.village} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, districtRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter Village Name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4" /> District</label>
                <input ref={districtRef} name="district" value={formData.district} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, companyRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter District Name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Building className="w-4 h-4" /> Company Name (Optional)</label>
                <input ref={companyRef} name="companyName" value={formData.companyName} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, referenceRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Business/Org name" />
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
                placeholder={isFetchingGaushalas ? 'Loading...' : !formData.cityId ? 'Select City First' : !filterLocationId ? 'Select Location First' : gaushalas.length === 0 ? 'No Gaushalas' : 'Select Gaushala (Optional)'}
                disabled={!!formData.kathaId || !filterLocationId || isFetchingGaushalas || gaushalas.length === 0}
                onDisabledClick={() => {
                  if (!formData.cityId) toast.info('Please select city first');
                }}
                onChange={(id) => setFormData(prev => ({ ...prev, gaushalaId: id }))}
                onClear={() => setFormData(prev => ({ ...prev, gaushalaId: '' }))}
              />
              <DonateDropdown label="Active Katha" icon={Mic2} value={formData.kathaId} items={kathas}
                placeholder={isFetchingKathas ? 'Loading...' : !formData.cityId ? 'Select City First' : !filterLocationId ? 'Select Location First' : kathas.length === 0 ? 'No Kathas' : 'Select Katha (Optional)'}
                disabled={!!formData.gaushalaId || !filterLocationId || isFetchingKathas || kathas.length === 0}
                onDisabledClick={() => {
                  if (!formData.cityId) toast.info('Please select city first');
                }}
                onChange={(id) => setFormData(prev => ({ ...prev, kathaId: id }))}
                onClear={() => setFormData(prev => ({ ...prev, kathaId: '' }))}
              />
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User className="w-4 h-4" /> Reference Name</label>
                <input ref={referenceRef} name="referenceName" value={formData.referenceName} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, amountRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter reference person name" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Mode
              </label>
              <div className="flex flex-wrap gap-4">
                {[{ value: 'online', label: 'UPI' }, { value: 'cash', label: 'Cash' }, { value: 'cheque', label: 'Cheque' }, { value: 'partially_paid', label: 'Partially Pay' }, { value: 'pay_later', label: 'Pay Later' }].map(mode => (
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
              <input ref={amountRef} required type="text" name="amount" value={formData.amount} onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, formData.paymentMode === 'partially_paid' ? paidAmountRef : submitRef)}
                className="w-full px-4 py-3 text-2xl font-bold border border-blue-300 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="0" />
            </div>

            {formData.paymentMode === 'partially_paid' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" /> Paid Amount (INR)
                  </label>
                  <input ref={paidAmountRef} required type="text" name="paidAmount" value={formData.paidAmount} onChange={handleInputChange}
                    onKeyDown={(e) => handleKeyDown(e, submitRef)}
                    className="w-full px-4 py-3 text-xl font-bold border border-green-300 bg-green-50 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition" placeholder="0" />
                </div>
              {formData.amount && Number(formData.amount.toString().replace(/,/g, '')) > 0 && (
                <p className="text-xs text-gray-500">
                  Minimum paid amount is 20% (
                  ₹{Math.ceil(Number(formData.amount.toString().replace(/,/g, '')) * 0.2).toLocaleString('en-IN')}
                  ) of total donation.
                </p>
              )}
                {formData.amount && formData.paidAmount && (() => {
                  const total = Number(formData.amount.toString().replace(/,/g, ''));
                  const paid = Number(formData.paidAmount.toString().replace(/,/g, ''));
                  const remaining = total - paid;
                  if (remaining > 0) {
                    return (
                      <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <span className="text-sm font-semibold text-orange-700">Remaining Amount</span>
                        <span className="text-lg font-bold text-orange-600 flex items-center gap-0.5">
                          <IndianRupee className="w-4 h-4" />
                          {remaining.toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>

          <button ref={submitRef} type="submit" disabled={isCreatingOrder}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-200 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50">
            {isCreatingOrder ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : 'Contribute Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
