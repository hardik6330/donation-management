import { useState, useEffect, useRef } from 'react';
import {
  useAddExpenseMutation,
  useUpdateExpenseMutation
} from '../../../../services/apiSlice';
import {
  Loader2, IndianRupee, Plus, Calendar, Tag, Building2, AlignLeft, CreditCard, Mic2, Edit,
  IndianRupeeIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import CustomDatePicker from '../../../../components/common/CustomDatePicker';

const categories = [
  { id: 'Food', name: 'Food' },
  { id: 'Medicine', name: 'Medicine' },
  { id: 'Maintenance', name: 'Maintenance' },
  { id: 'Salary', name: 'Salary' },
  { id: 'Utility', name: 'Utility' },
  { id: 'Other', name: 'Other' },
];

const paymentModes = [
  { id: 'cash', name: 'Cash' },
  { id: 'online', name: 'Online' },
  { id: 'check', name: 'Check' }
];

const AddExpenseModal = ({ 
  isOpen, 
  onClose, 
  editingExpense = null,
  gaushalaPagination,
  kathaPagination
}) => {
  const [addExpense, { isLoading: isAdding }] = useAddExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  
  const gaushalas = gaushalaPagination.items;
  const kathas = kathaPagination.items;

  // Refs for Fast Entry
  const amountRef = useRef(null);
  const categoryRef = useRef(null);
  const gaushalaRef = useRef(null);
  const kathaRef = useRef(null);
  const paymentModeRef = useRef(null);
  const descriptionRef = useRef(null);
  const submitRef = useRef(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    gaushalaId: '',
    kathaId: '',
    paymentMode: 'cash'
  });

  const [dropdownLabels, setDropdownLabels] = useState({
    categoryName: '',
    gaushalaName: '',
    kathaName: '',
    paymentModeName: 'Cash',
  });
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editingExpense) {
        const gaushala = gaushalas.find(g => g.id === editingExpense.gaushalaId);
        const katha = kathas.find(k => k.id === editingExpense.kathaId);
        const mode = paymentModes.find(m => m.id === editingExpense.paymentMode);
        setForm({
          date: editingExpense.date ? new Date(editingExpense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          amount: editingExpense.amount,
          category: editingExpense.category,
          description: editingExpense.description || '',
          gaushalaId: editingExpense.gaushalaId || '',
          kathaId: editingExpense.kathaId || '',
          paymentMode: editingExpense.paymentMode || 'cash'
        });
        setDropdownLabels({
          categoryName: editingExpense.category || '',
          gaushalaName: gaushala?.name || editingExpense.gaushala?.name || '',
          kathaName: katha?.name || editingExpense.katha?.name || '',
          paymentModeName: mode?.name || 'Cash',
        });
      } else {
        setForm({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          category: '',
          description: '',
          gaushalaId: '',
          kathaId: '',
          paymentMode: 'cash'
        });
        setDropdownLabels({
          categoryName: '',
          gaushalaName: '',
          kathaName: '',
          paymentModeName: 'Cash',
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [editingExpense, isOpen]);

  useEffect(() => {
    if (isOpen && amountRef.current) {
      amountRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDropdownSelect = (field, id, name) => {
    if (field === 'category') {
      setForm(prev => ({ ...prev, category: id }));
      setDropdownLabels(prev => ({ ...prev, categoryName: name }));
    } else if (field === 'gaushalaId') {
      setForm(prev => ({ ...prev, gaushalaId: id }));
      setDropdownLabels(prev => ({ ...prev, gaushalaName: name }));
    } else if (field === 'kathaId') {
      setForm(prev => ({ ...prev, kathaId: id }));
      setDropdownLabels(prev => ({ ...prev, kathaName: name }));
    } else if (field === 'paymentMode') {
      setForm(prev => ({ ...prev, paymentMode: id }));
      setDropdownLabels(prev => ({ ...prev, paymentModeName: name }));
    }
    setActiveDropdown(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount) {
      toast.error('Please enter amount');
      amountRef.current?.focus();
      return;
    }
    if (dropdownLabels.categoryName && !form.category) {
      toast.error('Please select a category from the list');
      categoryRef.current?.focus();
      return;
    }
    if (!form.category) {
      toast.error('Please select a category');
      categoryRef.current?.focus();
      return;
    }
    if (dropdownLabels.gaushalaName && !form.gaushalaId) {
      toast.error('Please select a Gaushala from the list');
      gaushalaRef.current?.focus();
      return;
    }
    if (dropdownLabels.kathaName && !form.kathaId) {
      toast.error('Please select a Katha from the list');
      kathaRef.current?.focus();
      return;
    }

    try {
      if (editingExpense) {
        await updateExpense({ id: editingExpense.id, ...form }).unwrap();
        toast.success('Expense updated successfully');
      } else {
        await addExpense(form).unwrap();
        toast.success('Expense recorded successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save expense');
    }
  };

  const isLoading = isAdding || isUpdating;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? "Edit Expense" : "Add New Expense"}
      icon={editingExpense ? <Edit /> : <IndianRupeeIcon />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomDatePicker
            label="Date"
            name="date"
            required
            value={form.date}
            onChange={handleChange}
            icon={Calendar}
          />
          <FormInput
            label="Amount"
            name="amount"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, categoryRef)}
            inputRef={amountRef}
            icon={IndianRupee}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchableDropdown
            label="Category"
            name="categoryName"
            placeholder="Select Category"
            value={dropdownLabels.categoryName}
            items={categories}
            onChange={(e) => {
              setDropdownLabels(prev => ({ ...prev, categoryName: e.target.value }));
              setForm(prev => ({ ...prev, category: '' }));
              setActiveDropdown('categoryName');
            }}
            onSelect={(id, name) => handleDropdownSelect('category', id, name)}
            onKeyDown={(e) => handleKeyDown(e, gaushalaRef)}
            isActive={activeDropdown === 'categoryName'}
            setActive={setActiveDropdown}
            required
            inputRef={categoryRef}
            icon={Tag}
          />
          <SearchableDropdown
            label="Gaushala"
            name="gaushalaName"
            placeholder="Select Gaushala (Optional)"
            value={dropdownLabels.gaushalaName}
            items={gaushalas}
            onChange={(e) => {
              setDropdownLabels(prev => ({ ...prev, gaushalaName: e.target.value }));
              setForm(prev => ({ ...prev, gaushalaId: '' }));
              setActiveDropdown('gaushalaName');
            }}
            onSelect={(id, name) => handleDropdownSelect('gaushalaId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, kathaRef)}
            isActive={activeDropdown === 'gaushalaName'}
            setActive={setActiveDropdown}
            inputRef={gaushalaRef}
            icon={Building2}
            isServerSearch={true}
            onLoadMore={gaushalaPagination.handleLoadMore}
            hasMore={gaushalaPagination.hasMore}
            loading={gaushalaPagination.loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchableDropdown
            label="Katha"
            name="kathaName"
            placeholder="Select Katha (Optional)"
            value={dropdownLabels.kathaName}
            items={kathas}
            onChange={(e) => {
              setDropdownLabels(prev => ({ ...prev, kathaName: e.target.value }));
              setForm(prev => ({ ...prev, kathaId: '' }));
              setActiveDropdown('kathaName');
            }}
            onSelect={(id, name) => handleDropdownSelect('kathaId', id, name)}
            onKeyDown={(e) => handleKeyDown(e, paymentModeRef)}
            isActive={activeDropdown === 'kathaName'}
            setActive={setActiveDropdown}
            inputRef={kathaRef}
            icon={Mic2}
            isServerSearch={true}
            onLoadMore={kathaPagination.handleLoadMore}
            hasMore={kathaPagination.hasMore}
            loading={kathaPagination.loading}
          />
          <SearchableDropdown
            label="Payment Mode"
            name="paymentModeName"
            placeholder="Select Mode"
            value={dropdownLabels.paymentModeName}
            items={paymentModes}
            onChange={(e) => {
              setDropdownLabels(prev => ({ ...prev, paymentModeName: e.target.value }));
              setActiveDropdown('paymentModeName');
            }}
            onSelect={(id, name) => handleDropdownSelect('paymentMode', id, name)}
            onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
            isActive={activeDropdown === 'paymentModeName'}
            setActive={setActiveDropdown}
            required
            inputRef={paymentModeRef}
            icon={CreditCard}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
            <AlignLeft className="w-3 h-3 text-gray-400" />
            Description
          </label>
          <textarea
            ref={descriptionRef}
            name="description"
            value={form.description}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, submitRef)}
            placeholder="Enter expense details..."
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
            ) : editingExpense ? (
              <Edit className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {editingExpense ? "Update Expense" : "Save Expense"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddExpenseModal;
