import React from 'react';
import { handleFormNavigation } from '../../utils/formNavigation';

const FormInput = ({ 
  label, 
  name, 
  value, 
  placeholder, 
  type = 'text', 
  required = false, 
  icon: Icon, 
  inputRef, 
  onKeyDown, 
  onChange,
  error,
  rows = 1,
  className = ""
}) => {
  const isTextarea = type === 'textarea';
  const Component = isTextarea ? 'textarea' : 'input';

  const handleKeyDownInternal = (e) => {
    // Only use default navigation if not handled by onKeyDown prop
    let handled = false;
    if (onKeyDown) {
      onKeyDown(e);
      // If the user's custom onKeyDown already called preventDefault, we assume it's handled
      if (e.defaultPrevented) handled = true;
    }

    if (!handled) {
      handleFormNavigation(e);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className={`text-[10px] font-bold uppercase ml-1 flex items-center gap-2 ${error ? 'text-red-500' : 'text-gray-500'}`}>
           {Icon && <Icon className="w-3 h-3" />} {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        {Icon && !isTextarea && (
          <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        )}
        <Component
          ref={inputRef}
          required={required}
          type={type}
          name={name}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDownInternal}
          className={`w-full ${Icon && !isTextarea ? 'pl-10' : 'px-4'} py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition ${isTextarea ? 'resize-none' : ''} 
            ${error 
              ? 'border-red-200 focus:ring-2 focus:ring-red-500 bg-red-50/30' 
              : 'border-gray-100 focus:ring-2 focus:ring-blue-500'
            }`}
        />
      </div>
      {error && (
        <p className="text-[10px] font-semibold text-red-500 ml-1 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
