import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import AdminModal from './AdminModal';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Confirm Delete"}
      icon={<Trash2 className="text-red-600" />}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-red-50 rounded-full text-red-600">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-800">Are you sure?</h3>
          <p className="text-gray-500 leading-relaxed">
            {message || "Do you really want to delete this record? This action cannot be undone."}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </AdminModal>
  );
};

export default DeleteConfirmationModal;
