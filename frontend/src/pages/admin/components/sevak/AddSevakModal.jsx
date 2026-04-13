import { useState, useEffect, useRef } from 'react';
import {
  useAddSevakMutation,
  useUpdateSevakMutation
} from '../../../../services/sevakApi';
import {
  Loader2, Plus, User, Phone, Mail, MapPin, Globe, Landmark, Edit
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';

const AddSevakModal = ({ isOpen, onClose, editingSevak = null }) => {
  const [addSevak, { isLoading: isAdding }] = useAddSevakMutation();
  const [updateSevak, { isLoading: isUpdating }] = useUpdateSevakMutation();

  // Refs for Fast Entry
  const nameRef = useRef(null);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const countryRef = useRef(null);
  const addressRef = useRef(null);
  const submitRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'India'
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = '';
    if (name === 'mobileNumber') {
      if (!value) error = 'Mobile number is required';
      else if (value.length !== 10) error = 'Enter exactly 10 digits';
    } else if (name === 'name') {
      if (!value) error = 'Name is required';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editingSevak) {
        setForm({
          name: editingSevak.name || '',
          mobileNumber: editingSevak.mobileNumber || '',
          email: editingSevak.email || '',
          address: editingSevak.address || '',
          city: editingSevak.city || '',
          state: editingSevak.state || '',
          country: editingSevak.country || 'India'
        });
      } else {
        setForm({
          name: '',
          mobileNumber: '',
          email: '',
          address: '',
          city: '',
          state: '',
          country: 'India'
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [editingSevak, isOpen]);

  const resetForm = () => {
    setForm({
      name: '',
      mobileNumber: '',
      email: '',
      address: '',
      city: '',
      state: '',
      country: 'India'
    });
    setErrors({});
  };

  // Fast Entry: Focus first field
  useEffect(() => {
    if (isOpen && nameRef.current) {
      nameRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef === submitRef) {
        handleSubmit(e);
      } else if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setForm(prev => ({ ...prev, [name]: cleaned }));
      validateField(name, cleaned);
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nameErr = validateField('name', form.name);
    const mobileErr = validateField('mobileNumber', form.mobileNumber);

    if (nameErr || mobileErr) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      if (editingSevak) {
        await updateSevak({ id: editingSevak.id, ...form }).unwrap();
        toast.success('Sevak updated successfully');
      } else {
        await addSevak(form).unwrap();
        toast.success('Sevak added successfully');
      }
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save sevak');
    }
  };

  const isLoading = isAdding || isUpdating;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSevak ? "Edit Sevak" : "Add New Sevak"}
      icon={editingSevak ? <Edit /> : <User />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Name"
            name="name"
            placeholder="Sevak Name"
            value={form.name}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, mobileRef)}
            inputRef={nameRef}
            icon={User}
            required
            error={errors.name}
          />
          <FormInput
            label="Mobile Number"
            name="mobileNumber"
            placeholder="10 digit mobile number"
            value={form.mobileNumber}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, emailRef)}
            inputRef={mobileRef}
            icon={Phone}
            required
            error={errors.mobileNumber}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="Optional email"
            value={form.email}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, cityRef)}
            inputRef={emailRef}
            icon={Mail}
          />
          <FormInput
            label="City"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, stateRef)}
            inputRef={cityRef}
            icon={Landmark}
            allowTransliteration={false}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="State"
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, countryRef)}
            inputRef={stateRef}
            icon={MapPin}
            allowTransliteration={false}
          />
          <FormInput
            label="Country"
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, addressRef)}
            inputRef={countryRef}
            icon={Globe}
            allowTransliteration={false}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-gray-400" />
            Address
          </label>
          <textarea
            ref={addressRef}
            name="address"
            value={form.address}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, submitRef)}
            placeholder="Enter full address..."
            rows="3"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 text-gray-700 resize-none"
          ></textarea>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            ref={submitRef}
            type="submit"
            disabled={isLoading}
            className="flex-[2] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {editingSevak ? "Update Sevak" : "Save Sevak"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddSevakModal;
