import { useState, useRef, useEffect } from 'react';
import { Loader2, Plus, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminModal from '../../../../components/common/AdminModal';
import FormInput from '../../../../components/common/FormInput';
import { useAddExpenseCategoryMutation } from '../../../../services/expenseCategoryApi';

const AddExpenseCategoryModal = ({ isOpen, onClose, onCreated }) => {
  const [addExpenseCategory, { isLoading }] = useAddExpenseCategoryMutation();
  const [name, setName] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Please enter category name');
      nameRef.current?.focus();
      return;
    }
    try {
      const res = await addExpenseCategory({ name: trimmed }).unwrap();
      toast.success(res?.message || 'Expense category saved');
      onCreated?.(res?.data);
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save category');
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Expense Category"
      icon={<Tag />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Category Name"
          name="name"
          placeholder="Ex: Food"
          value={name}
          onChange={(e) => setName(e.target.value)}
          inputRef={nameRef}
          icon={Tag}
          required
        />

        <div className="pt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Save Category
          </button>
        </div>
      </form>
    </AdminModal>
  );
};

export default AddExpenseCategoryModal;
