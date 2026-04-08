import { useState, useEffect, useRef } from 'react';
import {
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useGetGaushalasQuery
} from '../../../../services/apiSlice';
import {
  Loader2, IndianRupee, Plus, Calendar, Tag, Building2, AlignLeft, CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';

const AddExpenseModal = ({ isOpen, onClose, editingExpense = null }) => {
  const [addExpense, { isLoading: isAdding }] = useAddExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const { data: gaushalasData } = useGetGaushalasQuery({ fetchAll: 'true' });
  const gaushalas = gaushalasData?.data?.rows || [];

  // Refs for Fast Entry
  const dateRef = useRef(null);
  const amountRef = useRef(null);
  const categorySelectRef = useRef(null);
  const gaushalaSelectRef = useRef(null);
  const paymentModeRef = useRef(null);
  const descriptionRef = useRef(null);
  const submitRef = useRef(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Other',
    description: '',
    gaushalaId: '',
    paymentMode: 'cash'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editingExpense) {
        setForm({
          date: editingExpense.date ? new Date(editingExpense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          amount: editingExpense.amount,
          category: editingExpense.category,
          description: editingExpense.description || '',
          gaushalaId: editingExpense.gaushalaId || '',
          paymentMode: editingExpense.paymentMode || 'cash'
        });
      } else {
        setForm({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          category: 'Other',
          description: '',
          gaushalaId: '',
          paymentMode: 'cash'
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [editingExpense, isOpen]);

  // Fast Entry: Focus first field
  useEffect(() => {
    if (isOpen && dateRef.current) {
      dateRef.current.focus();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) {
      toast.error('Please fill in required fields');
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

  const categories = ['Food', 'Medicine', 'Maintenance', 'Salary', 'Utility', 'Other'];
  const paymentModes = [
    { value: 'cash', label: 'Cash' },
    { value: 'online', label: 'Online' },
    { value: 'check', label: 'Check' }
  ];

  const isLoading = isAdding || isUpdating;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? "Edit Expense" : "Add New Expense"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, amountRef)}
            inputRef={dateRef}
            icon={Calendar}
            required
          />
          <FormInput
            label="Amount"
            name="amount"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, categorySelectRef)}
            inputRef={amountRef}
            icon={IndianRupee}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
              <Tag className="w-3 h-3 text-gray-400" />
              Category
            </label>
            <select
              ref={categorySelectRef}
              name="category"
              value={form.category}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, gaushalaSelectRef)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 text-gray-700"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
              <Building2 className="w-3 h-3 text-gray-400" />
              Gaushala
            </label>
            <select
              ref={gaushalaSelectRef}
              name="gaushalaId"
              value={form.gaushalaId}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, paymentModeRef)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 text-gray-700"
            >
              <option value="">Select Gaushala (Optional)</option>
              {gaushalas.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
              <CreditCard className="w-3 h-3 text-gray-400" />
              Payment Mode
            </label>
            <select
              ref={paymentModeRef}
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 text-gray-700"
              required
            >
              {paymentModes.map(mode => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </div>
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
