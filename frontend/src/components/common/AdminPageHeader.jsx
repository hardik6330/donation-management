import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';

const AdminPageHeader = ({ title, subtitle, buttonText, onButtonClick, icon: Icon }) => {
  useEffect(() => {
    if (!onButtonClick) return;

    const handleShortcut = (e) => {
      // Ctrl + Z shortcut
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onButtonClick();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [onButtonClick]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
      </div>
      {buttonText && (
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={onButtonClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 w-fit"
          >
            {Icon ? <Icon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {buttonText}
          </button>
          <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">
            Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500">Ctrl + Z</kbd> to open
          </span>
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
