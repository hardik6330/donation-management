import React from 'react';
import { X, Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AdminModal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  children, 
  maxWidth = "max-w-2xl",
  showLanguageToggle = true 
}) => {
  const { isGujarati, toggleLanguage } = useLanguage();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`bg-white w-full ${maxWidth} rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-1">
            {icon && (
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                {React.cloneElement(icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
              </div>
            )}
            {typeof title === 'string' ? (
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
            ) : (
              title
            )}
          </div>
          
          <div className="flex items-center gap-2 mr-2">
            {showLanguageToggle && (
              <button
                onClick={toggleLanguage}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isGujarati
                    ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300 shadow-sm shadow-orange-100'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                }`}
                title={isGujarati ? "Switch to English" : "Switch to Gujarati"}
              >
                <Languages className="w-3.5 h-3.5" />
                {isGujarati ? 'ગુજ' : 'EN'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[85vh] sm:max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
