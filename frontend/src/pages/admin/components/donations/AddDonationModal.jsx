import { useState, useEffect, useRef } from 'react';
import {
  useCreateOrderMutation,
  useGetUserByMobileQuery
} from '../../../../services/apiSlice';
import {
  Loader2, IndianRupee, Plus, Phone, User,
  MapPin, UserCheck, Mail, Building2, Tag, CreditCard,
  HandCoins,
  HandCoinsIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
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
  categoryPagination
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
  const [activeAddDropdown, setActiveAddDropdown] = useState(null);

  // Refs for Fast Entry
  const mobileRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const companyRef = useRef(null);
  const addressRef = useRef(null);
  const cityRef = useRef(null);
  const talukaRef = useRef(null);
  const villageRef_add = useRef(null);
  const categoryRef = useRef(null);
  const gaushalaRef = useRef(null);
  const kathaRef = useRef(null);
  const referenceRef = useRef(null);
  const amountRef = useRef(null);
  const submitRef = useRef(null);

  const cities = cityPagination.items;
  const talukas = talukaPagination.items;
  const villages = villagePagination.items;
  const gaushalas = gaushalaPagination.items;
  const kathas = kathaPagination.items;
  const categories = categoryPagination.items;

  const selectedLocationId = addForm.villageId || addForm.talukaId || addForm.cityId;

  const { data: existingUser } = useGetUserByMobileQuery(addForm.mobileNumber, {
    skip: addForm.mobileNumber.length !== 10 || !isOpen,
  });

  // Fast Entry: Focus first field
  useEffect(() => {
    if (isOpen && mobileRef.current) {
      mobileRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
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
      return;
    }

    if (name === 'cityName') {
      setAddDropdownLabels(prev => ({ ...prev, cityName: value, talukaName: '', villageName: '' }));
      setAddForm(prev => ({ ...prev, cityId: '', talukaId: '', villageId: '' }));
      setActiveAddDropdown('cityName');
      return;
    }
    if (name === 'talukaName') {
      setAddDropdownLabels(prev => ({ ...prev, talukaName: value, villageName: '' }));
      setAddForm(prev => ({ ...prev, talukaId: '', villageId: '' }));
      setActiveAddDropdown('talukaName');
      return;
    }
    if (name === 'villageName') {
      setAddDropdownLabels(prev => ({ ...prev, villageName: value }));
      setAddForm(prev => ({ ...prev, villageId: '' }));
      setActiveAddDropdown('villageName');
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

    if (name === 'amount') {
      const rawValue = value.replace(/,/g, '');
      if (rawValue === '' || /^\d+$/.test(rawValue)) {
        const formattedValue = rawValue === '' ? '' : Number(rawValue).toLocaleString('en-IN');
        setAddForm(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }

    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDropdownSelect = (field, id, name) => {
    if (field === 'cityId') {
      setAddForm(prev => ({ ...prev, cityId: id, talukaId: '', villageId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, cityName: name, talukaName: '', villageName: '' }));
    } else if (field === 'talukaId') {
      setAddForm(prev => ({ ...prev, talukaId: id, villageId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, talukaName: name, villageName: '' }));
    } else if (field === 'villageId') {
      setAddForm(prev => ({ ...prev, villageId: id }));
      setAddDropdownLabels(prev => ({ ...prev, villageName: name }));
    } else if (field === 'categoryId') {
      setAddForm(prev => ({ ...prev, categoryId: id }));
      setAddDropdownLabels(prev => ({ ...prev, categoryName: name }));
    } else if (field === 'gaushalaId') {
      setAddForm(prev => ({ ...prev, gaushalaId: id, kathaId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, gaushalaName: name, kathaName: '' }));
    } else if (field === 'kathaId') {
      setAddForm(prev => ({ ...prev, kathaId: id, gaushalaId: '' }));
      setAddDropdownLabels(prev => ({ ...prev, kathaName: name, gaushalaName: '' }));
    } else if (field === 'paymentMode') {
      setAddForm(prev => ({ ...prev, paymentMode: id }));
      setAddDropdownLabels(prev => ({ ...prev, paymentModeName: name }));
    }
    setActiveAddDropdown(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

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
      await createDonation({
        ...addForm,
        amount: rawAmount
      }).unwrap();
      toast.success('Donation added successfully');
      resetAddForm();
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add donation');
    }
  };

  const resetAddForm = () => {
    setAddForm({
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
      paymentMode: 'cash',
    });
    setAddDropdownLabels({
      cityName: '',
      talukaName: '',
      villageName: '',
      categoryName: '',
      gaushalaName: '',
      kathaName: '',
      paymentModeName: 'Cash'
    });
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Donation"
      icon={<HandCoinsIcon />}
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
                  setActive={setActiveAddDropdown}
                  required
                  inputRef={cityRef}
                  icon={MapPin}
                />
                <SearchableDropdown
                  label="Taluka"
                  name="talukaName"
                  placeholder="Select Taluka"
                  value={addDropdownLabels.talukaName}
                  items={talukas}
                  onChange={handleAddInputChange}
                  onSelect={(id, name) => handleAddDropdownSelect('talukaId', id, name)}
                  onKeyDown={(e) => handleKeyDown(e, villageRef_add)}
                  isActive={activeAddDropdown === 'talukaName'}
                  setActive={setActiveAddDropdown}
                  disabled={!addForm.cityId}
                  inputRef={talukaRef}
                  icon={MapPin}
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
                  setActive={setActiveAddDropdown}
                  disabled={!addForm.talukaId}
                  inputRef={villageRef_add}
                  icon={MapPin}
                />
                <SearchableDropdown
                  label="Category"
                  name="categoryName"
                  placeholder="Select Category"
                  value={addDropdownLabels.categoryName}
                  items={categories}
                  onChange={handleAddInputChange}
                  onSelect={(id, name) => handleAddDropdownSelect('categoryId', id, name)}
                  onKeyDown={(e) => handleKeyDown(e, gaushalaRef)}
                  isActive={activeAddDropdown === 'categoryName'}
                  setActive={setActiveAddDropdown}
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
                  onKeyDown={(e) => handleKeyDown(e, kathaRef)}
                  isActive={activeAddDropdown === 'gaushalaName'}
                  setActive={setActiveAddDropdown}
                  disabled={!selectedLocationId || gaushalas.length === 0 || !!addForm.kathaId}
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
                  setActive={setActiveAddDropdown}
                  disabled={!selectedLocationId || kathas.length === 0 || !!addForm.gaushalaId}
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
                  onKeyDown={(e) => handleKeyDown(e, amountRef)}
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
                    { id: 'pay_later', name: 'Pay Later' }
                  ]}
                  onChange={handleAddInputChange}
                  onSelect={(id, name) => handleAddDropdownSelect('paymentMode', id, name)}
                  isActive={activeAddDropdown === 'paymentModeName'}
                  setActive={setActiveAddDropdown}
                  required
                  icon={CreditCard}
                />
              </div>

              <FormInput
                label="Donation Amount"
                name="amount"
                required
                placeholder="0"
                value={addForm.amount}
                onChange={handleAddInputChange}
                onKeyDown={(e) => handleKeyDown(e, submitRef)}
                inputRef={amountRef}
                icon={IndianRupee}
                className="donation-amount-field"
              />
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
