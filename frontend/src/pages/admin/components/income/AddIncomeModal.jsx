import { useState, useEffect, useRef } from 'react';
import {
  useAddIncomeMutation,
  useUpdateIncomeMutation
} from '../../../../services/incomeApi';
import {
  Loader2, IndianRupee, Plus, Calendar, Building2, AlignLeft, Edit,
  IndianRupeeIcon, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';
import SearchableDropdown from '../../../../components/common/SearchableDropdown';
import CustomDatePicker from '../../../../components/common/CustomDatePicker';

const AddIncomeModal = ({ 
  isOpen, 
  onClose, 
  editingIncome = null
}) => {
  const [addIncome, { isLoading: isAdding }] = useAddIncomeMutation();
  const [updateIncome, { isLoading: isUpdating }] = useUpdateIncomeMutation();
  
  // Refs for Fast Entry
  const titleRef = useRef(null);
  const amountRef = useRef(null);
  const noteRef = useRef(null);
  const submitRef = useRef(null);

  const [form, setForm] = useState(() => {
    if (editingIncome) {
      return {
        date: editingIncome.date || new Date().toISOString().split('T')[0],
        title: editingIncome.title || '',
        amount: editingIncome.amount || '',
        note: editingIncome.note || ''
      };
    }
    return {
      date: new Date().toISOString().split('T')[0],
      title: '',
      amount: '',
      note: ''
    };
  });

  useEffect(() => {
    if (isOpen) {
      titleRef.current?.focus();
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
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Please enter title');
      titleRef.current?.focus();
      return;
    }
    if (!form.amount) {
      toast.error('Please enter amount');
      amountRef.current?.focus();
      return;
    }

    try {
      if (editingIncome) {
        await updateIncome({ id: editingIncome.id, ...form }).unwrap();
        toast.success('Income updated successfully');
      } else {
        await addIncome(form).unwrap();
        toast.success('Income recorded successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save income');
    }
  };

  const isLoading = isAdding || isUpdating;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingIncome ? "Edit Income" : "Add New Income"}
      icon={editingIncome ? <Edit /> : <IndianRupeeIcon />}
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
            label="Title"
            name="title"
            placeholder="Income Title"
            value={form.title}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, amountRef)}
            inputRef={titleRef}
            icon={FileText}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Amount"
            name="amount"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, noteRef)}
            inputRef={amountRef}
            icon={IndianRupee}
            required
          />
          <FormInput
            label="Note"
            name="note"
            type="textarea"
            rows={3}
            placeholder="Additional details..."
            value={form.note}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, submitRef)}
            inputRef={noteRef}
            icon={AlignLeft}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            ref={submitRef}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingIncome ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingIncome ? 'Update Income' : 'Record Income'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddIncomeModal;
