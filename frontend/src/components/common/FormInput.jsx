import React from 'react';

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
  rows = 1,
  className = ""
}) => {
  const isTextarea = type === 'textarea';
  const Component = isTextarea ? 'textarea' : 'input';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
           {Icon && <Icon className="w-3 h-3" />} {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        {Icon && !isTextarea && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
          onKeyDown={onKeyDown}
          className={`w-full ${Icon && !isTextarea ? 'pl-10' : 'px-4'} py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition ${isTextarea ? 'resize-none' : ''}`}
        />
      </div>
    </div>
  );
};

export default FormInput;
