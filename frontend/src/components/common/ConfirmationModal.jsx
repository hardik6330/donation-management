import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import AdminModal from './AdminModal';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  isLoading,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning" // warning | success
}) => {
  const isWarning = type === "warning";

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Confirmation"}
      icon={isWarning ? <AlertCircle className="text-orange-500" /> : <CheckCircle2 className="text-green-600" />}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`p-3 rounded-full ${isWarning ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-600'}`}>
          {isWarning ? <AlertCircle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-800">{title || "Are you sure?"}</h3>
          <p className="text-gray-500 leading-relaxed text-sm">
            {message}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition text-sm"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-[2] px-4 py-2.5 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm ${
              isWarning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </AdminModal>
  );
};

export default ConfirmationModal;
