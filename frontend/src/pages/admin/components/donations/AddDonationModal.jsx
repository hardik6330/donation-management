import { useState, useEffect, useRef } from 'react';
import {
  useCreateOrderMutation
} from '../../../../services/donationApi';
import {
  useGetUserByMobileQuery
} from '../../../../services/authApi';
import {
  Loader2, IndianRupee, Plus, Phone, User,
  MapPin, UserCheck, Mail, Building2, Tag, CreditCard,
  HandCoins
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLocationDropdowns } from '../../../../hooks/useLocationDropdowns';
import { handleMutationError } from '../../../../utils/errorHelper';
import AdminModal from '../../../../components/common/AdminModal';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import FormInput from '../../../../components/common/FormInput';

const AddDonationModal = ({
  isOpen,
  onClose,
  cityPagination,
  talukaPagination,
  villagePagination,
  gaushalaPagination,
  kathaPagination,
  categoryPagination,
  setModalState
}) => {
  const [createDonation, { isLoading: isAdding }] = useCreateOrderMutation();

  const [addForm, setAddForm] = useState({
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
    gaushalaId: '',
    kathaId: '',
    companyName: '',
    referenceName: '',
    amount: '',
    paidAmount: '',
    paymentMode: 'cash',
  });

  const [addDropdownLabels, setAddDropdownLabels] = useState({
    cityName: '',
    talukaName: '',
    villageName: '',
    categoryName: '',
    gaushalaName: '',
    kathaName: '',
    paymentModeName: 'Cash',
  });

  const {
    cityRef,
    talukaRef,
    villageRef,
    handleLocationInputChange,
    handleLocationSelect
  } = useLocationDropdowns({
    cityPagination,
    talukaPagination,
    villagePagination,
    setModalState,
    onSelectCallback: (field, id, name) => {
      if (field === 'cityId') {
        setAddForm(prev => ({ ...prev, cityId: id, talukaId: '', villageId: '' }));
        setAddDropdownLabels(prev => ({ ...prev, cityName: name, talukaName: '', villageName: '' }));
      } else if (field === 'talukaId') {
        setAddForm(prev => ({ ...prev, talukaId: id, villageId: '' }));
        setAddDropdownLabels(prev => ({ ...prev, talukaName: name, villageName: '' }));
      } else if (field === 'villageId') {
        setAddForm(prev => ({ ...prev, villageId: id }));
        setAddDropdownLabels(prev => ({ ...prev, villageName: name }));
        setTimeout(() => categoryRef.current?.focus(), 100);
      }
    }
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = '';
    if (name === 'mobileNumber') {
      if (!value) error = 'Mobile number is required';
      else if (value.length !== 10) error = 'Enter exactly 10 digits';
    } else if (name === 'name') {
      if (!value) error = 'Donor name is required';
    } else if (name === 'amount') {
      const amt = Number(value.toString().replace(/,/g, ''));
      if (!value || amt <= 0) error = 'Enter valid amount';
    } else if (name === 'paidAmount' && addForm.paymentMode === 'partially_paid') {
      const total = Number(addForm.amount.toString().replace(/,/g, ''));
      const paid = Number(value.toString().replace(/,/g, ''));
      if (!value || paid <= 0) error = 'Enter paid amount';
      else if (paid >= total) error = 'Paid amount must be less than total';
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const [activeAddDropdown, setActiveAddDropdown] = useState(null);

  const handleSetActiveAddDropdown = (name) => {
    if ((name === 'gaushalaName' || name === 'kathaName') && !addForm.cityId) {
      toast.warn('Pela City select karo');
      return;
    }
    setActiveAddDropdown(name);
  };

  // Refs for Fast Entry
  const mobileRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const companyRef = useRef(null);
  const addressRef = useRef(null);
  const categoryRef = useRef(null);
  const gaushalaRef = useRef(null);
  const kathaRef = useRef(null);
  const referenceRef = useRef(null);
  const paymentModeRef = useRef(null);
  const amountRef = useRef(null);
  const paidAmountRef = useRef(null);
  const submitRef = useRef(null);

  const cities = cityPagination.items;
  const talukas = talukaPagination.items;
  const villages = villagePagination.items;
  const gaushalas = gaushalaPagination.items;
  const kathas = kathaPagination.items;
  const categories = categoryPagination.items;

  const { data: existingUser } = useGetUserByMobileQuery(addForm.mobileNumber, {
    skip: addForm.mobileNumber.length !== 10 || !isOpen,
  });

  // Fast Entry: Focus first field
  useEffect(() => {
    if (isOpen) {
      if (mobileRef.current) mobileRef.current.focus();

      // Load last donation details
      const lastDonation = localStorage.getItem('LAST_DONATION_DETAILS');
      if (lastDonation) {
        try {
          const { 
            cityId, cityName, 
            talukaId, talukaName, 
            villageId, villageName, 
            categoryId, categoryName 
          } = JSON.parse(lastDonation);
          setTimeout(() => {
            setAddForm(prev => ({
              ...prev,
              cityId: cityId || prev.cityId,
              talukaId: talukaId || prev.talukaId,
              villageId: villageId || prev.villageId,
              categoryId: categoryId || prev.categoryId,
            }));
            setAddDropdownLabels(prev => ({
              ...prev,
              cityName: cityName || prev.cityName,
              talukaName: talukaName || prev.talukaName,
              villageName: villageName || prev.villageName,
              categoryName: categoryName || prev.categoryName,
            }));
            
            // Also update modal state to fetch sub-locations
            if (cityId || talukaId || villageId) {
              setModalState(prev => ({
                ...prev,
                cityId: cityId || prev.cityId,
                talukaId: talukaId || prev.talukaId,
                villageId: villageId || prev.villageId,
              }));
            }
          }, 0);
        } catch (e) {
          console.error('Error parsing last donation details', e);
        }
      }
    }
  }, [isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef === submitRef) {
        handleAddSubmit(e);
      } else if (nextRef?.current) {
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
        setAddForm(prev => ({
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
        setAddDropdownLabels(prev => ({
          ...prev,
          cityName: user.city?.name || prev.cityName,
          talukaName: user.taluka?.name || prev.talukaName,
          villageName: user.village_loc?.name || prev.villageName,
        }));
        toast.info('User found! Details auto-filled.');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [existingUser]);

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobileNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
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

    if (name === 'cityName' || name === 'talukaName' || name === 'villageName') {
      const dropdown = handleLocationInputChange(name, value);
      if (dropdown) setActiveAddDropdown(dropdown);
      return;
    }

    if (name === 'categoryName') {
      setAddDropdownLabels(prev => ({ ...prev, categoryName: value }));
      setAddForm(prev => ({ ...prev, categoryId: '' }));
      setActiveAddDropdown('categoryName');
      return;
    }
    if (name === 'gaushalaName') {
      setAddDropdownLabels(prev => ({ ...prev, gaushalaName: value }));
      setAddForm(prev => ({ ...prev, gaushalaId: '' }));
      setActiveAddDropdown('gaushalaName');
      return;
    }
    if (name === 'kathaName') {
      setAddDropdownLabels(prev => ({ ...prev, kathaName: value }));
      setAddForm(prev => ({ ...prev, kathaId: '' }));
      setActiveAddDropdown('kathaName');
      return;
    }
    if (name === 'paymentModeName') {
      setAddDropdownLabels(prev => ({ ...prev, paymentModeName: value }));
      setActiveAddDropdown('paymentModeName');
      return;
    }

    setAddForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleAddDropdownSelect = (field, id, name) => {
    let nextRef = null;

    if (field === 'cityId' || field === 'talukaId' || field === 'villageId') {
      nextRef = handleLocationSelect(field, id, name);
    } else if (field === 'categoryId') {
      setAddForm(prev => ({ ...prev, categoryId: id }));
      setAddDropdownLabels(prev => ({ ...prev, categoryName: name }));
      nextRef = referenceRef;
    } else if (field === 'gaushalaId') {
      setAddForm(prev => ({ ...prev, gaushalaId: id, kathaId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, gaushalaName: name, kathaName: '' }));
      nextRef = referenceRef;
    } else if (field === 'kathaId') {
      setAddForm(prev => ({ ...prev, kathaId: id, gaushalaId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, kathaName: name, gaushalaName: '' }));
      nextRef = referenceRef;
    } else if (field === 'paymentMode') {
      setAddForm(prev => ({ ...prev, paymentMode: id, paidAmount: '' }));
      setAddDropdownLabels(prev => ({ ...prev, paymentModeName: name }));
      nextRef = amountRef;
    }
    setActiveAddDropdown(null);
    if (nextRef?.current) {
      setTimeout(() => nextRef.current.focus(), 100);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Final Validation check
    const mobileErr = validateField('mobileNumber', addForm.mobileNumber);
    const nameErr = validateField('name', addForm.name);
    const amountErr = validateField('amount', addForm.amount);
    const paidAmountErr = addForm.paymentMode === 'partially_paid' ? validateField('paidAmount', addForm.paidAmount) : '';

    if (mobileErr || nameErr || amountErr || paidAmountErr) {
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

    if (!addForm.categoryId && !addForm.gaushalaId && !addForm.kathaId) {
      toast.error('Please select any one: Category, Gaushala, or Katha');
      categoryRef.current?.focus();
      return;
    }

    const rawAmount = addForm.amount.toString().replace(/,/g, '');

    try {
      const rawPaid = addForm.paidAmount.toString().replace(/,/g, '');
      await createDonation({
        ...addForm,
        amount: rawAmount,
        paidAmount: addForm.paymentMode === 'partially_paid' ? Number(rawPaid) : undefined,
        cityName: addDropdownLabels.cityName,
        talukaName: addDropdownLabels.talukaName,
        villageName: addDropdownLabels.villageName,
      }).unwrap();

      // Save last donation details for next time
      localStorage.setItem('LAST_DONATION_DETAILS', JSON.stringify({
        cityId: addForm.cityId,
        cityName: addDropdownLabels.cityName,
        talukaId: addForm.talukaId,
        talukaName: addDropdownLabels.talukaName,
        villageId: addForm.villageId,
        villageName: addDropdownLabels.villageName,
        categoryId: addForm.categoryId,
        categoryName: addDropdownLabels.categoryName,
      }));

      toast.success('Donation added successfully');
      resetAddForm();
      onClose();
    } catch (error) { 
      handleMutationError(error, 'Failed to add donation');
    }
  };

  const resetAddForm = () => {
    // Check if we have last used details
    const lastDonation = localStorage.getItem('LAST_DONATION_DETAILS');
    let lastDetails = {};
    if (lastDonation) {
      try {
        lastDetails = JSON.parse(lastDonation);
      } catch (e) {
        console.error('Error parsing last donation details', e);
      }
    }

    setAddForm({
      mobileNumber: '',
      name: '',
      email: '',
      address: '',
      village: '',
      district: '',
      cityId: lastDetails.cityId || '',
      talukaId: lastDetails.talukaId || '',
      villageId: lastDetails.villageId || '',
      categoryId: lastDetails.categoryId || '',
      gaushalaId: '',
      kathaId: '',
      companyName: '',
      referenceName: '',
      amount: '',
      paidAmount: '',
      paymentMode: 'cash',
    });
    setAddDropdownLabels({
      cityName: lastDetails.cityName || '',
      talukaName: lastDetails.talukaName || '',
      villageName: lastDetails.villageName || '',
      categoryName: lastDetails.categoryName || '',
      gaushalaName: '',
      kathaName: '',
      paymentModeName: 'Cash'
    });
    setErrors({});
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Donation"
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
                required
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
                onKeyDown={(e) => handleKeyDown(e, emailRef)}
                inputRef={nameRef}
                icon={UserCheck}
                error={errors.name}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={addForm.email}
                  onChange={handleAddInputChange}
                  onKeyDown={(e) => handleKeyDown(e, companyRef)}
                  inputRef={emailRef}
                  icon={Mail}
                />
                <FormInput
                  label="Company (Opt)"
                  name="companyName"
                  placeholder="Business name"
                  value={addForm.companyName}
                  onChange={handleAddInputChange}
                  onKeyDown={(e) => handleKeyDown(e, addressRef)}
                  inputRef={companyRef}
                  icon={Building2}
                />
              </div>

              <FormInput
                label="Address"
                name="address"
                type="textarea"
                rows="2"
                placeholder="Complete address"
                value={addForm.address}
                onChange={handleAddInputChange}
                onKeyDown={(e) => handleKeyDown(e, cityRef)}
                inputRef={addressRef}
              />
            </div>
          </div>

          {/* Location & Donation Details Section */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Location & Donation Details
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <SearchableDropdown
                  label="City"
                  name="cityName"
                  placeholder="Select City"
                  value={addDropdownLabels.cityName}
                  items={cities}
                  onChange={handleAddInputChange}
                  onSelect={(id, name) => handleAddDropdownSelect('cityId', id, name)}
                  onKeyDown={(e) => handleKeyDown(e, talukaRef)}
                  isActive={activeAddDropdown === 'cityName'}
                  setActive={handleSetActiveAddDropdown}
                  required
                  inputRef={cityRef}
                  icon={MapPin}
                  allowTransliteration={false}
                />
                <SearchableDropdown
                  label="Taluka"
                  name="talukaName"
                  placeholder="Select Taluka"
                  value={addDropdownLabels.talukaName}
                  items={talukas}
                  onChange={handleAddInputChange}
                  onSelect={(id, name) => handleAddDropdownSelect('talukaId', id, name)}
                  onKeyDown={(e) => handleKeyDown(e, villageRef)}
                  isActive={activeAddDropdown === 'talukaName'}
                  setActive={handleSetActiveAddDropdown}
                  disabled={!addDropdownLabels.cityName}
                  inputRef={talukaRef}
                  icon={MapPin}
                  allowTransliteration={false}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SearchableDropdown
                  label="Village"
                  name="villageName"
                  placeholder="Select Village"
                  value={addDropdownLabels.villageName}
                  items={villages}
                  onChange={handleAddInputChange}
                  onSelect={(id, name) => handleAddDropdownSelect('villageId', id, name)}
                  onKeyDown={(e) => handleKeyDown(e, categoryRef)}
                  isActive={activeAddDropdown === 'villageName'}
                  setActive={handleSetActiveAddDropdown}
                  disabled={!addDropdownLabels.talukaName}
                  inputRef={villageRef}
                  icon={MapPin}
                  allowTransliteration={false}
                />
                <SearchableDropdown
                  label="Category"
                  name="categoryName"
                  placeholder="Select Category"
                  value={addDropdownLabels.categoryName}
                  items={categories}
                  onChange={handleAddInputChange}
                  onSelect={(id, name) => handleAddDropdownSelect('categoryId', id, name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // If no selection, just move to next logical field
                      if (gaushalas.length > 0) gaushalaRef.current?.focus();
                      else if (kathas.length > 0) kathaRef.current?.focus();
                      else referenceRef.current?.focus();
                    }
                  }}
                  isActive={activeAddDropdown === 'categoryName'}
                  setActive={handleSetActiveAddDropdown}
                  inputRef={categoryRef}
                  icon={Tag}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SearchableDropdown
                  label="Gaushala"
                  name="gaushalaName"
                  placeholder="Select Gaushala"
                  value={addDropdownLabels.gaushalaName}
                  items={gaushalas}
                  onChange={handleAddInputChange}
                  onSelect={(id, name) => handleAddDropdownSelect('gaushalaId', id, name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (kathas.length > 0) kathaRef.current?.focus();
                      else referenceRef.current?.focus();
                    }
                  }}
                  isActive={activeAddDropdown === 'gaushalaName'}
                  setActive={handleSetActiveAddDropdown}
                  disabled={!!addForm.kathaId || (!!addForm.cityId && gaushalas.length === 0)}
                  inputRef={gaushalaRef}
                  icon={Building2}
                />
                <SearchableDropdown
                  label="Active Katha"
                  name="kathaName"
                  placeholder="Select Katha"
                  value={addDropdownLabels.kathaName}
                  items={kathas}
                  onChange={handleAddInputChange}
                  onSelect={(id, name) => handleAddDropdownSelect('kathaId', id, name)}
                  onKeyDown={(e) => handleKeyDown(e, referenceRef)}
                  isActive={activeAddDropdown === 'kathaName'}
                  setActive={handleSetActiveAddDropdown}
                  disabled={!!addForm.gaushalaId || (!!addForm.cityId && kathas.length === 0)}
                  inputRef={kathaRef}
                  icon={Tag}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Reference"
                  name="referenceName"
                  placeholder="Reference name"
                  value={addForm.referenceName}
                  onChange={handleAddInputChange}
                  onKeyDown={(e) => handleKeyDown(e, paymentModeRef)}
                  inputRef={referenceRef}
                  icon={User}
                />
                <SearchableDropdown
                  label="Mode"
                  name="paymentModeName"
                  placeholder="Select Mode"
                  value={addDropdownLabels.paymentModeName}
                  items={[
                    { id: 'cash', name: 'Cash' },
                    { id: 'online', name: 'Online' },
                    { id: 'cheque', name: 'Cheque' },
                    { id: 'partially_paid', name: 'Partially Pay' },
                    { id: 'pay_later', name: 'Pay Later' }
                  ]}
                  onChange={handleAddInputChange}
                  onSelect={(id, name) => handleAddDropdownSelect('paymentMode', id, name)}
                  onKeyDown={(e) => handleKeyDown(e, amountRef)}
                  isActive={activeAddDropdown === 'paymentModeName'}
                  setActive={handleSetActiveAddDropdown}
                  inputRef={paymentModeRef}
                  required
                  icon={CreditCard}
                  allowTransliteration={false}
                />
              </div>

              <FormInput
                label="Donation Amount"
                name="amount"
                required
                placeholder="0"
                value={addForm.amount}
                onChange={handleAddInputChange}
                onKeyDown={(e) => handleKeyDown(e, addForm.paymentMode === 'partially_paid' ? paidAmountRef : submitRef)}
                inputRef={amountRef}
                icon={IndianRupee}
                className="donation-amount-field"
                error={errors.amount}
              />

              {addForm.paymentMode === 'partially_paid' && (
                <>
                  <FormInput
                    label="Paid Amount"
                    name="paidAmount"
                    required
                    placeholder="0"
                    value={addForm.paidAmount}
                    onChange={handleAddInputChange}
                    onKeyDown={(e) => handleKeyDown(e, submitRef)}
                    inputRef={paidAmountRef}
                    icon={IndianRupee}
                    error={errors.paidAmount}
                  />
                  {addForm.amount && addForm.paidAmount && (() => {
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
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            ref={submitRef}
            type="submit"
            disabled={isAdding}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            {isAdding ? <Loader2 className="animate-spin" /> : <Plus className="w-5 h-5" />}
            {isAdding ? 'Creating...' : 'Create Donation'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddDonationModal;
