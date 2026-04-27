import React, { useState, useEffect, useRef } from 'react';
import { useCreateOrderMutation } from '../services/donationApi';
import { useGetUserByMobileQuery } from '../services/authApi';
import {
  useGetCategoriesQuery
} from '../services/masterApi';
import { useGetGaushalasQuery } from '../services/gaushalaApi';
import { useGetKathasQuery } from '../services/kathaApi';
import { IndianRupee, User, Mail, Home as HomeIcon, Building, MapPin, Loader2, Phone, Tag, Mic2, Building2, X, ChevronDown, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';
import { transliterateToGujarati } from '../utils/gujaratiTransliteration';

// Reusable dropdown for Donate page
const DonateDropdown = ({ label, icon: Icon, value, items = [], placeholder, onChange, onClear, disabled = false, onDisabledClick, inputRef, onKeyDown, defaultName = '', onQueryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  const listRef = useRef(null);

  const selectedItem = items.find(i => i.id === value);
  const displayName = selectedItem?.name || defaultName || placeholder;

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
    setTimeout(() => {
      setHighlightIndex(filtered.length > 0 ? 0 : -1);
    }, 0);
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
    onChange(item.id, item.name);
    setIsOpen(false);
    setQuery('');
  };

  const handleInputChangeInternal = (e) => {
    const val = e.target.value;
    setQuery(val);
    setHighlightIndex(0);
    if (onQueryChange) onQueryChange(val);
  };

  const handleKeyDownInternal = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        if (!disabled) {
          setIsOpen(true);
          setQuery('');
          setHighlightIndex(-1);
        }
      } else if (e.key === 'Enter') {
        if (onKeyDown) onKeyDown(e);
      } else if (e.key.length === 1 && !disabled) {
        e.preventDefault();
        setIsOpen(true);
        setQuery(e.key);
        setHighlightIndex(0);
        if (onQueryChange) onQueryChange(e.key);
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
      if (filtered.length === 0) {
        // If nothing filtered, treat current query as custom input if supported
        if (onQueryChange && query) {
          onQueryChange(query);
          setIsOpen(false);
        }
        return;
      }
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
        ref={inputRef}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDownInternal}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm cursor-pointer flex items-center justify-between transition outline-none
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-300'}
        `}
      >
        {isOpen ? (
          <input
            type="text"
            value={query}
            onChange={handleInputChangeInternal}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDownInternal}
            autoFocus
            placeholder={selectedItem?.name || defaultName || placeholder}
            className="w-full bg-transparent text-gray-800 placeholder:text-gray-400 outline-none"
          />
        ) : (
          <span className={(selectedItem || defaultName) ? 'text-gray-800' : 'text-gray-400'}>
            {displayName}
          </span>
        )}
        <div className="flex items-center gap-1 text-gray-400">
          {(value || defaultName) && !disabled && (
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
        <div className="absolute z-50 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={{ width }}>
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
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const companyRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const gaushalaDropdownRef = useRef(null);
  const kathaDropdownRef = useRef(null);
  const referenceRef = useRef(null);
  const amountRef = useRef(null);
  const submitRef = useRef(null);

  const [isGujarati, setIsGujarati] = useState(false);
  const [rawInputs, setRawInputs] = useState({});
  const TRANSLITERATE_FIELDS = ['name', 'referenceName', 'address', 'city', 'state', 'country', 'companyName'];

  const [formData, setFormData] = useState({
    mobileNumber: '', name: '', email: '', address: '',
    cityId: '', talukaId: '', villageId: '', categoryId: '', gaushalaId: '', kathaId: '',
    companyName: '', referenceName: '', amount: '', paymentMode: 'online', status: 'completed', paidAmount: '',
    city: '', state: '', country: '',
  });

  const [formLabels, setFormLabels] = useState({
    categoryName: '',
    gaushalaName: '',
    kathaName: '',
  });

  // Fast Entry: Focus first field on mount
  useEffect(() => {
    if (mobileRef.current) mobileRef.current.focus();

    // Load last donation details
    const lastDonation = localStorage.getItem('LAST_DONATION_DETAILS');
    if (lastDonation) {
      try {
        const { 
          categoryId, categoryName,
        } = JSON.parse(lastDonation);
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            categoryId: categoryId || prev.categoryId,
          }));
          setFormLabels(prev => ({
            ...prev,
            categoryName: categoryName || prev.categoryName,
          }));
        }, 0);
      } catch (e) {
        console.error('Error parsing last donation details', e);
      }
    }
  }, []);

  const { data: categoriesData } = useGetCategoriesQuery({ fetchAll: true });
  const { data: gaushalasData, isFetching: isFetchingGaushalas } = useGetGaushalasQuery({ fetchAll: 'true', active: 'true' });
  const { data: kathasData, isFetching: isFetchingKathas } = useGetKathasQuery({ fetchAll: 'true' });

  const categories = categoriesData?.data?.items || [];
  const gaushalas = gaushalasData?.data?.items || [];
  const kathas = kathasData?.data?.items || [];

  const { data: existingUser, isFetching: isCheckingUser } = useGetUserByMobileQuery(formData.mobileNumber, {
    skip: formData.mobileNumber.length < 10,
  });

  useEffect(() => {
    if (existingUser?.success && existingUser.data) {
      const user = existingUser.data;
      const timer = setTimeout(() => {
        setFormData(prev => ({
          ...prev, name: user.name || '', email: user.email || '', address: user.address || '',
          city: user.city || '', state: user.state || '', country: user.country || '', companyName: user.companyName || '',
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

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
      return;
    }

    const name = e.target.name;
    if (isGujarati && TRANSLITERATE_FIELDS.includes(name)) {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const raw = rawInputs[name] || '';
        const newRaw = raw.slice(0, -1);
        setRawInputs(prev => ({ ...prev, [name]: newRaw }));
        setFormData(prev => ({ ...prev, [name]: transliterateToGujarati(newRaw) }));
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const raw = (rawInputs[name] || '') + e.key;
        setRawInputs(prev => ({ ...prev, [name]: raw }));
        setFormData(prev => ({ ...prev, [name]: transliterateToGujarati(raw) }));
      }
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
    if (!formData.mobileNumber) {
      toast.warning('Please enter a mobile number');
      mobileRef.current?.focus();
      return;
    }
    if (!formData.name.trim()) {
      toast.warning('Please enter your full name');
      nameRef.current?.focus();
      return;
    }
    const rawAmount = formData.amount.toString().replace(/,/g, '');
    const totalAmount = Number(rawAmount);
    if (!rawAmount || totalAmount <= 0) {
      toast.warning('Please enter a valid donation amount');
      return;
    }
    if (!formData.categoryId) {
      toast.warning('Please select a Category');
      categoryDropdownRef.current?.focus();
      return;
    }
    if (!formData.gaushalaId && !formData.kathaId) {
      toast.warning('Please select any one: Gaushala or Active Katha');
      gaushalaDropdownRef.current?.focus();
      return;
    }
    try {
      const { paidAmount: _, ...cleanFormData } = formData;
      const rawPaid = (formData.paidAmount || '').toString().replace(/,/g, '');
      await createOrder({
        ...cleanFormData,
        amount: Number(rawAmount),
        paidAmount: formData.status === 'partially_paid' ? Number(rawPaid) : undefined,
      }).unwrap();

      // Save last donation details for next time
      localStorage.setItem('LAST_DONATION_DETAILS', JSON.stringify({
        categoryId: formData.categoryId,
        categoryName: formLabels.categoryName,
      }));

      const msg = 'Donation Recorded Successfully!. Thank you for your support.';
      toast.success(msg, { autoClose: 5000 });
      fireFireworks();
      setTimeout(() => navigate('/'), 6000);

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
        <div className="bg-blue-600 p-4 sm:p-6 text-white text-center relative">
          <h1 className="text-xl sm:text-2xl font-bold">Support Shree Sarveshwar Gaudham</h1>
          <p className="text-sm opacity-90">Your contribution makes a difference in our community</p>
          <button
            type="button"
            onClick={() => setIsGujarati(prev => !prev)}
            className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isGujarati
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-blue-500 text-white hover:bg-blue-400'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            {isGujarati ? 'ગુજ' : 'EN'}
          </button>
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
                  <Phone className="w-4 h-4" /> Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input ref={mobileRef} required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, nameRef)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="9876543210" />
                  {isCheckingUser && <div className="absolute right-3 top-3"><Loader2 className="w-4 h-4 animate-spin text-blue-600" /></div>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User className="w-4 h-4" /> Full Name <span className="text-red-500">*</span></label>
                <input ref={nameRef} required name="name" value={formData.name} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, referenceRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User className="w-4 h-4" /> Reference Name</label>
                <input ref={referenceRef} name="referenceName" value={formData.referenceName} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, emailRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Enter reference person name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Address</label>
                <input ref={emailRef} type="email" name="email" value={formData.email} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, addressRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><HomeIcon className="w-4 h-4" /> Address</label>
                <input ref={addressRef} name="address" value={formData.address} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, cityRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Street name, house no." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Country
                </label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData(prev => ({ ...prev, country: val }));
                  }}
                  onKeyDown={(e) => handleKeyDown(e, stateRef)}
                  inputRef={countryRef}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition uppercase"
                  placeholder="INDIA"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> State
                </label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData(prev => ({ ...prev, state: val }));
                  }}
                  onKeyDown={(e) => handleKeyDown(e, cityRef)}
                  inputRef={stateRef}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition uppercase"
                  placeholder="GUJARAT"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> City
                </label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData(prev => ({ ...prev, city: val }));
                  }}
                  onKeyDown={(e) => handleKeyDown(e, companyRef)}
                  inputRef={cityRef}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition uppercase"
                  placeholder="SURAT"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Building className="w-4 h-4" /> Company Name</label>
                <input ref={companyRef} name="companyName" value={formData.companyName} onChange={handleInputChange} onKeyDown={(e) => handleKeyDown(e, categoryDropdownRef)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Business/Org name" />
              </div>
            </div>
          </div>

          {/* Donation Details Section */}
          <div className="space-y-4">
            <div className="border-b border-blue-50 pb-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
                <IndianRupee className="w-4 h-4" /> Donation Details
              </div>
              <p className="text-xs text-gray-500 mt-1">Category is required, and please select any one: Gaushala or Katha</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <DonateDropdown label={<>Category <span className="text-red-500">*</span></>} icon={Tag} value={formData.categoryId} items={categories} placeholder="Select Category" required
                inputRef={categoryDropdownRef}
                defaultName={formLabels.categoryName}
                onKeyDown={(e) => {
                  const hasGaushalas = gaushalas.length > 0 && !formData.kathaId;
                  const hasKathas = kathas.length > 0 && !formData.gaushalaId;
                  if (hasGaushalas) handleKeyDown(e, gaushalaDropdownRef);
                  else if (hasKathas) handleKeyDown(e, kathaDropdownRef);
                  else handleKeyDown(e, amountRef);
                }}
                onChange={(id, name) => {
                  setFormData(prev => ({ ...prev, categoryId: id }));
                  setFormLabels(prev => ({ ...prev, categoryName: name }));
                }}
                onClear={() => {
                  setFormData(prev => ({ ...prev, categoryId: '' }));
                  setFormLabels(prev => ({ ...prev, categoryName: '' }));
                }}
              />
              <DonateDropdown label="Gaushala" icon={Building2} value={formData.gaushalaId} items={gaushalas}
                inputRef={gaushalaDropdownRef}
                defaultName={formLabels.gaushalaName}
                onKeyDown={(e) => {
                  const hasKathas = kathas.length > 0 && !formData.gaushalaId;
                  if (hasKathas) handleKeyDown(e, kathaDropdownRef);
                  else handleKeyDown(e, amountRef);
                }}
                placeholder={isFetchingGaushalas ? 'Loading...' : formData.kathaId ? 'Disabled (Katha selected)' : gaushalas.length === 0 ? 'No Gaushalas' : 'Select Gaushala'}
                disabled={!!formData.kathaId || isFetchingGaushalas || gaushalas.length === 0}
                onChange={(id, name) => {
                  setFormData(prev => ({ ...prev, gaushalaId: id }));
                  setFormLabels(prev => ({ ...prev, gaushalaName: name }));
                }}
                onClear={() => {
                  setFormData(prev => ({ ...prev, gaushalaId: '' }));
                  setFormLabels(prev => ({ ...prev, gaushalaName: '' }));
                }}
              />
              <DonateDropdown label="Active Katha" icon={Mic2} value={formData.kathaId} items={kathas}
                inputRef={kathaDropdownRef}
                defaultName={formLabels.kathaName}
                onKeyDown={(e) => handleKeyDown(e, amountRef)}
                placeholder={isFetchingKathas ? 'Loading...' : formData.gaushalaId ? 'Disabled (Gaushala selected)' : kathas.length === 0 ? 'No Kathas' : 'Select Katha'}
                disabled={!!formData.gaushalaId || isFetchingKathas || kathas.length === 0}
                onChange={(id, name) => {
                  setFormData(prev => ({ ...prev, kathaId: id }));
                  setFormLabels(prev => ({ ...prev, kathaName: name }));
                }}
                onClear={() => {
                  setFormData(prev => ({ ...prev, kathaId: '' }));
                  setFormLabels(prev => ({ ...prev, kathaName: '' }));
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" /> Donation Amount (INR) <span className="text-red-500">*</span>
              </label>
              <input ref={amountRef} required type="text" name="amount" value={formData.amount} onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, submitRef)}
                className="w-full px-4 py-3 text-2xl font-bold border border-blue-300 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="0" />
            </div>
          </div>

          <button ref={submitRef} type="submit" disabled={isCreatingOrder}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-200 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50">
            {isCreatingOrder ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : 'Donate Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
