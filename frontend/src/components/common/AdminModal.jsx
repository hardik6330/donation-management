import React from 'react';
import { X } from 'lucide-react';

const AdminModal = ({ isOpen, onClose, title, icon, children, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`bg-white w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-1">
            {icon && (
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                {React.cloneElement(icon, { className: 'w-5 h-5' })}
              </div>
            )}
            {typeof title === 'string' ? (
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            ) : (
              title
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
