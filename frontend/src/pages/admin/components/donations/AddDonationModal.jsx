  import { useState, useEffect, useRef } from 'react';
  import {
    useCreateOrderMutation,
    useGetLatestSlipNoQuery,
    useUpdateDonationMutation
  } from '../../../../services/donationApi';
  import {
    useGetUserByMobileQuery
  } from '../../../../services/authApi';
  import {
    useGetSevakByMobileQuery
  } from '../../../../services/sevakApi';
  import {
    Loader2, IndianRupee, Plus, Phone, User,
    MapPin, UserCheck, Mail, Building2, Tag, CreditCard,
    HandCoins, Calendar
  } from 'lucide-react';

  const todayISO = () => new Date().toISOString().slice(0, 10);
  import { toast } from 'react-toastify';
  import { handleMutationError } from '../../../../utils/errorHelper';
  import AdminModal from '../../../../components/common/AdminModal';
  import SearchableDropdown from '../../../../components/common/SearchableDropdown';
  import FormInput from '../../../../components/common/FormInput';
  import CustomDatePicker from '../../../../components/common/CustomDatePicker';
  import { donationPaymentModes, donationStatuses } from '../../../../utils/tableUtils';

  const LAST_DONATION_PREFS_KEY = 'LAST_DONATION_PREFS';

  const getStoredDonationPrefs = () => {
    try {
      const raw = localStorage.getItem(LAST_DONATION_PREFS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.error('Error parsing donation prefs', error);
      return {};
    }
  };

  const AddDonationModal = ({
    isOpen,
    onClose,
    gaushalaPagination,
    kathaPagination,
    categoryPagination,
    onCreated,
    onUpdated,
    editingDonation = null,
  }) => {
    const isEditMode = !!editingDonation;
    const storedPrefs = getStoredDonationPrefs();
    const [createDonation, { isLoading: isAdding }] = useCreateOrderMutation();
    const [updateDonation, { isLoading: isUpdating }] = useUpdateDonationMutation();
    const { data: latestSlipData } = useGetLatestSlipNoQuery(undefined, {
      skip: !isOpen
    });

    const [addForm, setAddForm] = useState({
      mobileNumber: '',
      name: '',
      email: '',
      address: '',
      city: storedPrefs.city || '',
      state: storedPrefs.state || '',
      country: storedPrefs.country || '',
      categoryId: storedPrefs.categoryId || '',
      gaushalaId: storedPrefs.gaushalaId || '',
      kathaId: storedPrefs.kathaId || '',
      companyName: '',
      birthDate: '',
      referenceName: '',
      amount: '0',
      paidAmount: '',
      paymentMode: storedPrefs.paymentMode || 'cash',
      status: storedPrefs.status || 'completed',
      slipNo: '',
      donationDate: storedPrefs.donationDate || todayISO(),
      paymentDate: storedPrefs.paymentDate || todayISO(),
      notes: '',
    });

    const [generateSlip, setGenerateSlip] = useState(false);

    const [addDropdownLabels, setAddDropdownLabels] = useState({
      categoryName: storedPrefs.categoryName || '',
      gaushalaName: storedPrefs.gaushalaName || '',
      kathaName: storedPrefs.kathaName || '',
      paymentModeName: storedPrefs.paymentModeName || 'Cash',
      statusName: storedPrefs.statusName || 'Completed',
    });

    const [errors, setErrors] = useState({});

    const validateField = (name, value) => {
      let error = '';
      if (name === 'mobileNumber') {
        // Mobile validation logic if needed
      } else if (name === 'name') {
        if (!value) error = 'Donor name is required';
      } else if (name === 'amount') {
        if (!value) error = 'Enter amount';
      } else if (name === 'paidAmount' && addForm.status === 'partially_paid') {
        const total = Number(addForm.amount.toString().replace(/,/g, ''));
        const paid = Number(value.toString().replace(/,/g, ''));
        if (!value || paid <= 0) error = 'Enter paid amount';
        else if (paid >= total) error = 'Paid amount must be less than total';
      } else if (name === 'slipNo') {
        if (addForm.status === 'completed' && !value) error = 'Slip number is required';
      }
      
      setErrors(prev => ({ ...prev, [name]: error }));
      return error;
    };

    const [activeAddDropdown, setActiveAddDropdown] = useState(null);

    const handleSetActiveAddDropdown = (name) => {
      setActiveAddDropdown(name);
    };

    // Refs for Fast Entry
    const mobileRef = useRef(null);
    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const companyRef = useRef(null);
    const addressRef = useRef(null);
    const cityRef = useRef(null);
    const stateRef = useRef(null);
    const countryRef = useRef(null);
    const categoryRef = useRef(null);
    const gaushalaRef = useRef(null);
    const kathaRef = useRef(null);
    const referenceRef = useRef(null);
    const paymentModeRef = useRef(null);
    const statusRef = useRef(null);
    const slipNoRef = useRef(null);
    const donationDateRef = useRef(null);
    const paymentDateRef = useRef(null);
    const notesRef = useRef(null);
    const birthDateRef = useRef(null);
    const amountRef = useRef(null);
    const paidAmountRef = useRef(null);
    const generateSlipRef = useRef(null);
    const submitRef = useRef(null);
    const isSubmittingRef = useRef(false);

    const gaushalas = gaushalaPagination.items;
    const kathas = kathaPagination.items;
    const categories = categoryPagination.items;

    const { data: existingUser } = useGetUserByMobileQuery(addForm.mobileNumber, {
      skip: addForm.mobileNumber.length < 10 || !isOpen || isEditMode,
    });

    const { data: existingSevak } = useGetSevakByMobileQuery(addForm.mobileNumber, {
      skip: addForm.mobileNumber.length < 10 || !isOpen || isEditMode || !!existingUser?.success,
    });

    // Fast Entry: Focus first field
    useEffect(() => {
      if (isOpen) {
        if (mobileRef.current) mobileRef.current.focus();
      }
    }, [isOpen]);

    const handleKeyDown = (e, nextRef, prevRef) => {
      const target = e.target || {};
      const selectionStart = typeof target.selectionStart === 'number'
        ? target.selectionStart
        : null;
      const valueLength = typeof target.value === 'string' ? target.value.length : 0;
      const cannotTrackCaret = selectionStart === null;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (nextRef?.current) {
          nextRef.current.focus();
        }
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && prevRef?.current) {
        // Only move if cursor is at the beginning or everything is selected
        if (selectionStart === 0 || cannotTrackCaret) {
          e.preventDefault();
          prevRef.current.focus();
        }
      } else if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && nextRef?.current) {
        // Only move if cursor is at the end or everything is selected
        if (selectionStart === valueLength || cannotTrackCaret) {
          e.preventDefault();
          nextRef.current.focus();
        }
      }
    };

    // Close add dropdowns on click outside
    useEffect(() => {
      const handleClickOutside = () => setActiveAddDropdown(null);
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // Auto-fill form when user is found
    useEffect(() => {
      if (existingUser?.success && existingUser.data) {
        const user = existingUser.data;
        const timer = setTimeout(() => {
          const isoDate = (v) => v ? new Date(v).toISOString().slice(0, 10) : '';
          setAddForm(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            country: user.country || '',
            companyName: user.companyName || '',
            birthDate: user.birthDate ? new Date(user.birthDate).toISOString().slice(0, 10) : '',
            donationDate: isoDate(user.lastDonationDate) || prev.donationDate,
            paymentDate: isoDate(user.lastPaymentDate) || prev.paymentDate,
          }));
          toast.info('User found! Details auto-filled.');
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [existingUser]);

    // Fallback: auto-fill from Sevak when no User matches
    useEffect(() => {
      if (existingSevak?.success && existingSevak.data) {
        const sevak = existingSevak.data;
        const timer = setTimeout(() => {
          setAddForm(prev => ({
            ...prev,
            name: sevak.name || '',
            email: sevak.email || '',
            address: sevak.address || '',
            city: sevak.city || '',
            state: sevak.state || '',
            country: sevak.country || '',
          }));
          toast.info('Sevak found! Details auto-filled.');
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [existingSevak]);

    // Auto-fill latest slip number ONCE per modal-open / per transition to
    // 'completed'. We track via a ref so manually clearing the field doesn't
    // trigger a re-fill — once the user has touched it, we leave it alone.
    const slipAutofilledRef = useRef(false);

    const slipFieldVisible = addForm.status === 'completed'
      || ((addForm.status === 'pay_later' || addForm.status === 'partially_paid') && generateSlip);

    useEffect(() => {
      if (!isOpen) {
        slipAutofilledRef.current = false;
        return;
      }
      if (!slipFieldVisible) {
        slipAutofilledRef.current = false;
        return;
      }
      if (slipAutofilledRef.current) return;
      if (addForm.slipNo) {
        slipAutofilledRef.current = true;
        return;
      }
      const next = latestSlipData?.success ? latestSlipData.data?.nextSlipNo : null;
      if (next) {
        slipAutofilledRef.current = true;
        setAddForm(prev => (prev.slipNo ? prev : { ...prev, slipNo: next }));
      }
    }, [isOpen, latestSlipData, slipFieldVisible, addForm.slipNo]);

    // Reset generateSlip when status moves to/from completed
    useEffect(() => {
      if (addForm.status === 'completed') {
        setGenerateSlip(false);
      }
    }, [addForm.status]);

    // Clear slipNo when slip field becomes hidden so a stale number
    // doesn't get sent for pay_later / partially_paid donations.
    useEffect(() => {
      if (!isOpen) return;
      if (slipFieldVisible) return;
      if (!addForm.slipNo) return;
      setAddForm(prev => ({ ...prev, slipNo: '' }));
      setErrors(prev => ({ ...prev, slipNo: '' }));
    }, [isOpen, slipFieldVisible]);

    // Prefill when editing an existing donation
    useEffect(() => {
      if (!isOpen || !editingDonation) return;
      const d = editingDonation;
      const donor = d.donor || {};
      const isoDate = (v) => v ? new Date(v).toISOString().slice(0, 10) : '';
      setAddForm({
        mobileNumber: donor.mobileNumber || '',
        name: donor.name || '',
        email: donor.email || '',
        address: donor.address || '',
        city: donor.city || '',
        state: donor.state || '',
        country: donor.country || '',
        categoryId: d.categoryId || '',
        gaushalaId: d.gaushalaId || '',
        kathaId: d.kathaId || '',
        companyName: donor.companyName || '',
        birthDate: (donor.birthDate ? String(donor.birthDate).slice(0, 10) : ''),
        referenceName: d.referenceName || '',
        amount: d.amount != null ? Number(d.amount).toLocaleString('en-IN') : '',
        paidAmount: d.paidAmount != null ? Number(d.paidAmount).toLocaleString('en-IN') : '',
        paymentMode: d.paymentMode || 'cash',
        status: d.status || 'completed',
        slipNo: d.slipNo || '',
        donationDate: isoDate(d.donationDate) || todayISO(),
        paymentDate: isoDate(d.paymentDate) || '',
        notes: d.notes || '',
      });
      setGenerateSlip(!!d.slipNo && d.status !== 'completed');
      const lookupName = (list, id) => list.find(item => item.id === id)?.name || '';
      setAddDropdownLabels({
        categoryName: d.category?.name || lookupName(categoryPagination.items, d.categoryId),
        gaushalaName: d.gaushala?.name || lookupName(gaushalaPagination.items, d.gaushalaId),
        kathaName: d.katha?.name || lookupName(kathaPagination.items, d.kathaId),
        paymentModeName: (donationPaymentModes.find(m => m.id === d.paymentMode)?.name) || 'Cash',
        statusName: (donationStatuses.find(s => s.id === d.status)?.name) || 'Completed',
      });
      setErrors({});
    }, [isOpen, editingDonation, categoryPagination.items, gaushalaPagination.items, kathaPagination.items]);

    const handleAddInputChange = (e) => {
      const { name, value } = e.target;

      if (name === 'name' || name === 'referenceName' || name === 'companyName' || name === 'notes' || name === 'address') {
        const capitalized = value.replace(/\b\w/g, (c) => c.toUpperCase());
        setAddForm(prev => ({ ...prev, [name]: capitalized }));
        validateField(name, capitalized);
        return;
      }

      if (name === 'mobileNumber') {
        const cleaned = value.replace(/\D/g, '');
        setAddForm(prev => ({ ...prev, [name]: cleaned }));
        validateField(name, cleaned);
        return;
      }

      if (name === 'amount' || name === 'paidAmount') {
        const rawValue = value.replace(/,/g, '');
        if (rawValue === '' || /^\d+$/.test(rawValue)) {
          const formattedValue = rawValue === '' ? '' : Number(rawValue).toLocaleString('en-IN');
          setAddForm(prev => ({ ...prev, [name]: formattedValue }));
          validateField(name, formattedValue);
        }
        return;
      }

      if (name === 'categoryName') {
        setAddDropdownLabels(prev => ({ ...prev, categoryName: value }));
        setAddForm(prev => ({ ...prev, categoryId: '' }));
        categoryPagination.handleSearch(value);
        setActiveAddDropdown('categoryName');
        return;
      }
      if (name === 'gaushalaName') {
        setAddDropdownLabels(prev => ({ ...prev, gaushalaName: value }));
        setAddForm(prev => ({ ...prev, gaushalaId: '' }));
        gaushalaPagination.handleSearch(value);
        setActiveAddDropdown('gaushalaName');
        return;
      }
      if (name === 'kathaName') {
        setAddDropdownLabels(prev => ({ ...prev, kathaName: value }));
        setAddForm(prev => ({ ...prev, kathaId: '' }));
        kathaPagination.handleSearch(value);
        setActiveAddDropdown('kathaName');
        return;
      }
      if (name === 'paymentModeName') {
        setAddDropdownLabels(prev => ({ ...prev, paymentModeName: value }));
        setActiveAddDropdown('paymentModeName');
        return;
      }
      if (name === 'statusName') {
        setAddDropdownLabels(prev => ({ ...prev, statusName: value }));
        setActiveAddDropdown('statusName');
        return;
      }

      if (name === 'donationDate') {
        setAddForm(prev => {
          let nextPayment = prev.paymentDate;
          if (prev.status === 'completed') {
            nextPayment = value;
          } else if (nextPayment && value && nextPayment < value) {
            nextPayment = value;
          }
          return { ...prev, donationDate: value, paymentDate: nextPayment };
        });
        return;
      }

      setAddForm(prev => ({ ...prev, [name]: value }));
      validateField(name, value);
    };

    const handleAddDropdownSelect = (field, id, name) => {
      let nextRef = null;

      if (field === 'categoryId') {
        setAddForm(prev => ({ ...prev, categoryId: id }));
        setAddDropdownLabels(prev => ({ ...prev, categoryName: name }));
        nextRef = addForm.gaushalaId ? gaushalaRef : kathaRef;
      } else if (field === 'gaushalaId') {
        setAddForm(prev => ({ ...prev, gaushalaId: id, kathaId: '' }));
        setAddDropdownLabels(prev => ({ ...prev, gaushalaName: name, kathaName: '' }));
        nextRef = paymentModeRef;
      } else if (field === 'kathaId') {
        setAddForm(prev => ({ ...prev, kathaId: id, gaushalaId: '' }));
        setAddDropdownLabels(prev => ({ ...prev, kathaName: name, gaushalaName: '' }));
        nextRef = paymentModeRef;
      } else if (field === 'paymentMode') {
        setAddForm(prev => ({ ...prev, paymentMode: id }));
        setAddDropdownLabels(prev => ({ ...prev, paymentModeName: name }));
        nextRef = statusRef;
      } else if (field === 'status') {
        setAddForm(prev => ({
          ...prev,
          status: id,
          paidAmount: prev.status === id ? prev.paidAmount : '',
          paymentDate: id === 'completed' ? prev.donationDate : (id === 'pay_later' ? '' : (prev.paymentDate || prev.donationDate)),
        }));
        setAddDropdownLabels(prev => ({ ...prev, statusName: name }));
        nextRef = amountRef;
      }
      setActiveAddDropdown(null);
      if (nextRef?.current) {
        setTimeout(() => nextRef.current.focus(), 100);
      }
    };

    const handleAddSubmit = async (e) => {
      e.preventDefault();

      if (isSubmittingRef.current) return;

      // Final Validation check
      const mobileErr = validateField('mobileNumber', addForm.mobileNumber);
      const nameErr = validateField('name', addForm.name);
      const slipNoErr = addForm.status === 'completed' ? validateField('slipNo', addForm.slipNo) : '';
      const amountErr = validateField('amount', addForm.amount);
      const paidAmountErr = addForm.status === 'partially_paid' ? validateField('paidAmount', addForm.paidAmount) : '';

      if (mobileErr || nameErr || slipNoErr || amountErr || paidAmountErr) {
        toast.error('Please fix the errors in the form');
        return;
      }

      if (addDropdownLabels.gaushalaName && !addForm.gaushalaId) {
        toast.error('Please select a Gaushala from the list');
        gaushalaRef.current?.focus();
        return;
      }
      if (addDropdownLabels.kathaName && !addForm.kathaId) {
        toast.error('Please select a Katha from the list');
        kathaRef.current?.focus();
        return;
      }

      if (!addForm.categoryId) {
        toast.error('Please select a Category');
        categoryRef.current?.focus();
        return;
      }

      if (!addForm.gaushalaId && !addForm.kathaId) {
        toast.error('Please select any one: Gaushala or Katha');
        gaushalaRef.current?.focus();
        return;
      }

      const rawAmount = addForm.amount.toString().replace(/,/g, '');

      isSubmittingRef.current = true;
      try {
        const rawPaid = addForm.paidAmount.toString().replace(/,/g, '');

        if (isEditMode) {
          const result = await updateDonation({
            id: editingDonation.id,
            amount: Number(rawAmount),
            status: addForm.status,
            paymentMode: addForm.paymentMode,
            slipNo: slipFieldVisible ? (addForm.slipNo || null) : null,
            categoryId: addForm.categoryId || null,
            paidAmount: addForm.status === 'partially_paid' ? Number(rawPaid) : undefined,
            donationDate: addForm.donationDate || null,
            paymentDate: addForm.status === 'pay_later' ? null : (addForm.paymentDate || null),
            notes: addForm.notes || null,
            referenceName: addForm.referenceName || null,
            // Donor fields
            mobileNumber: addForm.mobileNumber,
            name: addForm.name,
            email: addForm.email,
            address: addForm.address,
            city: addForm.city,
            state: addForm.state,
            country: addForm.country,
            companyName: addForm.companyName,
            birthDate: addForm.birthDate || null,
          }).unwrap();

          if (typeof onUpdated === 'function') onUpdated(result);
          toast.success('Donation updated successfully');
          onClose();
          return;
        }

        const result = await createDonation({
          ...addForm,
          amount: Number(rawAmount),
          paidAmount: addForm.status === 'partially_paid' ? Number(rawPaid) : undefined,
          paymentDate: addForm.status === 'pay_later' ? null : (addForm.paymentDate || null),
        }).unwrap();

        // Trigger focused polling in parent so the PDF icon appears as soon as the worker finishes.
        const newId = result?.data?.id;
        if (newId && typeof onCreated === 'function') onCreated(newId);

        // Save reusable form preferences for fast entry
        localStorage.setItem(LAST_DONATION_PREFS_KEY, JSON.stringify({
          city: addForm.city,
          state: addForm.state,
          country: addForm.country,
          categoryId: addForm.categoryId,
          gaushalaId: addForm.gaushalaId,
          kathaId: addForm.kathaId,
          categoryName: addDropdownLabels.categoryName,
          gaushalaName: addDropdownLabels.gaushalaName,
          kathaName: addDropdownLabels.kathaName,
          paymentMode: addForm.paymentMode,
          status: addForm.status,
          paymentModeName: addDropdownLabels.paymentModeName,
          statusName: addDropdownLabels.statusName,
          donationDate: addForm.donationDate,
          paymentDate: addForm.paymentDate,
        }));

        toast.success('Donation added successfully');
        resetAddForm();
        onClose();
      } catch (error) {
        handleMutationError(error, isEditMode ? 'Failed to update donation' : 'Failed to add donation');
      } finally {
        isSubmittingRef.current = false;
      }
    };

    const resetAddForm = () => {
      const lastPrefs = getStoredDonationPrefs();

      setAddForm({
        mobileNumber: '',
        name: '',
        email: '',
        address: '',
        city: lastPrefs.city || '',
        state: lastPrefs.state || '',
        country: lastPrefs.country || '',
        categoryId: lastPrefs.categoryId || '',
        gaushalaId: lastPrefs.gaushalaId || '',
        kathaId: lastPrefs.kathaId || '',
        companyName: '',
      birthDate: '',
        referenceName: '',
        amount: '0',
        paidAmount: '',
        paymentMode: lastPrefs.paymentMode || 'cash',
        status: lastPrefs.status || 'completed',
        slipNo: '',
        donationDate: lastPrefs.donationDate || todayISO(),
        paymentDate: lastPrefs.paymentDate || todayISO(),
        notes: '',
      });
      setAddDropdownLabels({
        categoryName: lastPrefs.categoryName || '',
        gaushalaName: lastPrefs.gaushalaName || '',
        kathaName: lastPrefs.kathaName || '',
        paymentModeName: lastPrefs.paymentModeName || 'Cash',
        statusName: lastPrefs.statusName || 'Completed',
      });
      setErrors({});
    };

    return (
      <AdminModal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? 'Edit Donation' : 'Create New Donation'}
        icon={<HandCoins />}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Donor Information Section */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3 h-3" /> Donor Information
              </h4>

              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  label="Mobile Number"
                  name="mobileNumber"
                  placeholder="10-digit mobile number"
                  value={addForm.mobileNumber}
                  onChange={handleAddInputChange}
                  onKeyDown={(e) => handleKeyDown(e, nameRef)}
                  inputRef={mobileRef}
                  icon={Phone}
                  error={errors.mobileNumber}
                />

                <FormInput
                  label="Full Name"
                  name="name"
                  placeholder="Enter donor name"
                  required
                  value={addForm.name}
                  onChange={handleAddInputChange}
                  onKeyDown={(e) => handleKeyDown(e, referenceRef, mobileRef)}
                  inputRef={nameRef}
                  icon={UserCheck}
                  error={errors.name}
                />

                <FormInput
                  label="Reference Name"
                  name="referenceName"
                  placeholder="Reference person name"
                  value={addForm.referenceName}
                  onChange={handleAddInputChange}
                  onKeyDown={(e) => handleKeyDown(e, emailRef, nameRef)}
                  inputRef={referenceRef}
                  icon={User}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={addForm.email}
                    onChange={handleAddInputChange}
                    onKeyDown={(e) => handleKeyDown(e, companyRef, referenceRef)}
                    inputRef={emailRef}
                    icon={Mail}
                  />
                  <FormInput
                    label="Company (Opt)"
                    name="companyName"
                    placeholder="Business name"
                    value={addForm.companyName}
                    onChange={handleAddInputChange}
                    onKeyDown={(e) => handleKeyDown(e, birthDateRef, emailRef)}
                    inputRef={companyRef}
                    icon={Building2}
                  />
                </div>

                <CustomDatePicker
                  label="Birth Date"
                  name="birthDate"
                  value={addForm.birthDate}
                  onChange={handleAddInputChange}
                  onKeyDown={(e) => handleKeyDown(e, addressRef, companyRef)}
                  inputRef={birthDateRef}
                  icon={Calendar}
                />

                <FormInput
                  label="Address"
                  name="address"
                  type="textarea"
                  rows="2"
                  placeholder="Complete address"
                  value={addForm.address}
                  onChange={handleAddInputChange}
                  onKeyDown={(e) => handleKeyDown(e, cityRef, companyRef)}
                  inputRef={addressRef}
                />

                {/* Location: City, State, Country */}
                <div className="grid grid-cols-3 gap-4">
                  <FormInput
                    label="City"
                    name="city"
                    placeholder="Enter city"
                    value={addForm.city}
                    onChange={handleAddInputChange}
                    onKeyDown={(e) => handleKeyDown(e, stateRef, addressRef)}
                    inputRef={cityRef}
                    icon={MapPin}
                    allowTransliteration={false}
                  />
                  <FormInput
                    label="State"
                    name="state"
                    placeholder="Enter state"
                    value={addForm.state}
                    onChange={handleAddInputChange}
                    onKeyDown={(e) => handleKeyDown(e, countryRef, cityRef)}
                    inputRef={stateRef}
                    icon={MapPin}
                    allowTransliteration={false}
                  />
                  <FormInput
                    label="Country"
                    name="country"
                    placeholder="Enter country"
                    value={addForm.country}
                    onChange={handleAddInputChange}
                    onKeyDown={(e) => handleKeyDown(e, categoryRef, stateRef)}
                    inputRef={countryRef}
                    icon={MapPin}
                    allowTransliteration={false}
                  />
                </div>
              </div>
            </div>

            {/* Donation Details Section */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Donation Details
              </h4>

              <div className="grid grid-cols-1 gap-4">
                {/* Row 2: Category, Gaushala */}
                <div className="grid grid-cols-2 gap-4">
                  <SearchableDropdown
                    label="Category"
                    name="categoryName"
                    placeholder="Select Category"
                    value={addDropdownLabels.categoryName}
                    items={categories}
                    onChange={handleAddInputChange}
                    onSelect={(id, name) => handleAddDropdownSelect('categoryId', id, name)}
                    onClear={() => handleAddDropdownSelect('categoryId', '', '')}
                    onKeyDown={(e) => handleKeyDown(e, addForm.gaushalaId ? gaushalaRef : kathaRef, countryRef)}
                    isActive={activeAddDropdown === 'categoryName'}
                    setActive={handleSetActiveAddDropdown}
                    inputRef={categoryRef}
                    icon={Tag}
                    isServerSearch={true}
                    onLoadMore={categoryPagination.handleLoadMore}
                    hasMore={categoryPagination.hasMore}
                    loading={categoryPagination.loading}
                    allowTransliteration={false}
                    required
                  />
                  <SearchableDropdown
                    label="Active Katha"
                    name="kathaName"
                    placeholder="Select Katha"
                    value={addDropdownLabels.kathaName}
                    items={kathas}
                    onChange={handleAddInputChange}
                    onSelect={(id, name) => handleAddDropdownSelect('kathaId', id, name)}
                    onClear={() => handleAddDropdownSelect('kathaId', '', '')}
                    onKeyDown={(e) => handleKeyDown(e, addForm.kathaId ? paymentModeRef : gaushalaRef, categoryRef)}
                    isActive={activeAddDropdown === 'kathaName'}
                    setActive={handleSetActiveAddDropdown}
                    disabled={!!addForm.gaushalaId}
                    inputRef={kathaRef}
                    icon={Tag}
                    isServerSearch={true}
                    onLoadMore={kathaPagination.handleLoadMore}
                    hasMore={kathaPagination.hasMore}
                    loading={kathaPagination.loading}
                    allowTransliteration={false}
                  />
                </div>

                {/* Row 3: Gaushala */}
                <div className="grid grid-cols-2 gap-4">
                  <SearchableDropdown
                    label="Gaushala"
                    name="gaushalaName"
                    placeholder="Select Gaushala"
                    value={addDropdownLabels.gaushalaName}
                    items={gaushalas}
                    onChange={handleAddInputChange}
                    onSelect={(id, name) => handleAddDropdownSelect('gaushalaId', id, name)}
                    onClear={() => handleAddDropdownSelect('gaushalaId', '', '')}
                    onKeyDown={(e) => handleKeyDown(e, paymentModeRef, addForm.gaushalaId ? categoryRef : kathaRef)}
                    isActive={activeAddDropdown === 'gaushalaName'}
                    setActive={handleSetActiveAddDropdown}
                    disabled={!!addForm.kathaId}
                    inputRef={gaushalaRef}
                    icon={Building2}
                    isServerSearch={true}
                    onLoadMore={gaushalaPagination.handleLoadMore}
                    hasMore={gaushalaPagination.hasMore}
                    loading={gaushalaPagination.loading}
                    allowTransliteration={false}
                  />
                </div>

                {/* Row 4: Payment Mode, Status */}
                <div className="grid grid-cols-2 gap-4">
                  <SearchableDropdown
                    label="Payment Mode"
                    name="paymentModeName"
                    placeholder="Select Mode"
                    value={addDropdownLabels.paymentModeName}
                    items={donationPaymentModes}
                    onChange={handleAddInputChange}
                    onSelect={(id, name) => handleAddDropdownSelect('paymentMode', id, name)}
                    onKeyDown={(e) => handleKeyDown(e, statusRef, addForm.kathaId ? kathaRef : gaushalaRef)}
                    isActive={activeAddDropdown === 'paymentModeName'}
                    setActive={handleSetActiveAddDropdown}
                    inputRef={paymentModeRef}
                    required
                    icon={CreditCard}
                    allowTransliteration={false}
                  />
                  <SearchableDropdown
                    label="Status"
                    name="statusName"
                    placeholder="Select Status"
                    value={addDropdownLabels.statusName}
                    items={donationStatuses}
                    onChange={handleAddInputChange}
                    onSelect={(id, name) => handleAddDropdownSelect('status', id, name)}
                    onKeyDown={(e) => handleKeyDown(e, amountRef, paymentModeRef)}
                    isActive={activeAddDropdown === 'statusName'}
                    setActive={handleSetActiveAddDropdown}
                    inputRef={statusRef}
                    required
                    icon={CreditCard}
                    allowTransliteration={false}
                  />
                </div>

                {/* Row 5: Amount (+ Paid Amount if partial) */}
                <div className={`grid ${addForm.status === 'partially_paid' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  <FormInput
                    label="Donation Amount"
                    name="amount"
                    required
                    placeholder="0"
                    value={addForm.amount}
                    onChange={handleAddInputChange}
                    onKeyDown={(e) => handleKeyDown(e, addForm.status === 'partially_paid' ? paidAmountRef : (addForm.status === 'pay_later' ? generateSlipRef : (slipFieldVisible ? slipNoRef : donationDateRef)), statusRef)}
                    inputRef={amountRef}
                    icon={IndianRupee}
                    error={errors.amount}
                  />
                  {addForm.status === 'partially_paid' && (
                    <FormInput
                      label="Paid Amount"
                      name="paidAmount"
                      required
                      placeholder="0"
                      value={addForm.paidAmount}
                      onChange={handleAddInputChange}
                      onKeyDown={(e) => handleKeyDown(e, generateSlipRef, amountRef)}
                      inputRef={paidAmountRef}
                      icon={IndianRupee}
                      error={errors.paidAmount}
                    />
                  )}
                </div>

                {(addForm.status === 'pay_later' || addForm.status === 'partially_paid') && (
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer select-none">
                    <input
                      ref={generateSlipRef}
                      type="checkbox"
                      checked={generateSlip}
                      onChange={(e) => setGenerateSlip(e.target.checked)}
                      onKeyDown={(e) => {
                        const prevRef = addForm.status === 'partially_paid' ? paidAmountRef : amountRef;
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setGenerateSlip(v => !v);
                        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                          e.preventDefault();
                          (slipFieldVisible ? slipNoRef : donationDateRef).current?.focus();
                        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                          e.preventDefault();
                          prevRef.current?.focus();
                        }
                      }}
                      className="w-4 h-4 accent-blue-600"
                    />
                    Generate Slip Number
                  </label>
                )}

                {slipFieldVisible && (
                  <FormInput
                    label="Slip Number"
                    name="slipNo"
                    placeholder="Enter slip number"
                    required
                    value={addForm.slipNo}
                    onChange={handleAddInputChange}
                    onKeyDown={(e) => handleKeyDown(e, donationDateRef, (addForm.status === 'pay_later' || addForm.status === 'partially_paid') ? generateSlipRef : (addForm.status === 'partially_paid' ? paidAmountRef : amountRef))}
                    inputRef={slipNoRef}
                    icon={Tag}
                    error={errors.slipNo}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <CustomDatePicker
                    label="Donation Date"
                    name="donationDate"
                    value={addForm.donationDate}
                    onChange={handleAddInputChange}
                    onKeyDown={(e) => handleKeyDown(e, addForm.status === 'pay_later' ? notesRef : paymentDateRef, slipFieldVisible ? slipNoRef : ((addForm.status === 'pay_later' || addForm.status === 'partially_paid') ? generateSlipRef : (addForm.status === 'partially_paid' ? paidAmountRef : amountRef)))}
                    inputRef={donationDateRef}
                    icon={Calendar}
                  />
                  <CustomDatePicker
                    label="Payment Date"
                    name="paymentDate"
                    value={addForm.paymentDate}
                    onChange={handleAddInputChange}
                    onKeyDown={(e) => handleKeyDown(e, notesRef, donationDateRef)}
                    inputRef={paymentDateRef}
                    icon={Calendar}
                    disabled={addForm.status === 'pay_later'}
                    minDate={addForm.donationDate}
                  />
                </div>

                <FormInput
                  label="Note"
                  name="notes"
                  type="textarea"
                  rows="2"
                  placeholder="Optional note about this donation"
                  value={addForm.notes}
                  onChange={handleAddInputChange}
                  onKeyDown={(e) => handleKeyDown(e, submitRef, addForm.status === 'pay_later' ? donationDateRef : paymentDateRef)}
                  inputRef={notesRef}
                />

                {addForm.status === 'partially_paid' && addForm.amount && addForm.paidAmount && (() => {
                  const total = Number(addForm.amount.toString().replace(/,/g, ''));
                  const paid = Number(addForm.paidAmount.toString().replace(/,/g, ''));
                  const remaining = total - paid;
                  if (remaining > 0) {
                    return (
                      <div className="flex items-center justify-between px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <span className="text-xs font-semibold text-orange-700">Remaining</span>
                        <span className="text-sm font-bold text-orange-600 flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {remaining.toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              tabIndex={-1}
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              ref={submitRef}
              type="submit"
              disabled={isAdding || isUpdating}
              onKeyDown={(e) => {
                if (e.key === 'Enter') return;
                handleKeyDown(e, null, notesRef);
              }}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              {(isAdding || isUpdating) ? <Loader2 className="animate-spin" /> : <Plus className="w-5 h-5" />}
              {isEditMode ? ((isUpdating ? 'Updating...' : 'Update Donation')) : (isAdding ? 'Creating...' : 'Create Donation')}
            </button>
          </div>
        </form>
      </AdminModal>
    );
  };

  export default AddDonationModal;
