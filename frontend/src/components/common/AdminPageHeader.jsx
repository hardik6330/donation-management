import React from 'react';
import { Plus } from 'lucide-react';

const AdminPageHeader = ({ title, subtitle, buttonText, onButtonClick, icon: Icon }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
      </div>
      {buttonText && (
        <button
          onClick={onButtonClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 w-fit"
        >
          {Icon ? <Icon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default AdminPageHeader;
