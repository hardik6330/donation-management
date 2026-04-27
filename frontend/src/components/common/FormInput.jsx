import React, { useRef, useEffect } from 'react';
import { handleFormNavigation } from '../../utils/formNavigation';
import { useLanguage } from '../../context/LanguageContext';
import { transliterateToGujarati } from '../../utils/gujaratiTransliteration';

const TRANSLITERATE_TYPES = ['text', 'textarea'];
const SKIP_NAMES = ['email', 'mobileNumber', 'mobile', 'phone', 'password', 'amount', 'paidAmount', 'price', 'search'];

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
  className = "",
  allowTransliteration = true,
  disabled = false
}) => {
  const isTextarea = type === 'textarea';
  const Component = isTextarea ? 'textarea' : 'input';
  const { isGujarati } = useLanguage();

  const rawInputRef = useRef('');
  const lastSetValueRef = useRef('');

  const shouldTransliterate = isGujarati && allowTransliteration && TRANSLITERATE_TYPES.includes(type) && !SKIP_NAMES.includes(name);

  // Detect external value changes (e.g. auto-fill, form reset)
  useEffect(() => {
    if (value !== lastSetValueRef.current) {
      rawInputRef.current = '';
      lastSetValueRef.current = value;
    }
  }, [value]);

  const handleKeyDownInternal = (e) => {
    // Let custom onKeyDown run first (Enter navigation etc.)
    if (onKeyDown) {
      onKeyDown(e);
      if (e.defaultPrevented) return;
    }

    // Gujarati transliteration
    if (shouldTransliterate) {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const newRaw = rawInputRef.current.slice(0, -1);
        rawInputRef.current = newRaw;
        const transliterated = transliterateToGujarati(newRaw);
        lastSetValueRef.current = transliterated;
        if (onChange) onChange({ target: { name, value: transliterated } });
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const newRaw = rawInputRef.current + e.key;
        rawInputRef.current = newRaw;
        const transliterated = transliterateToGujarati(newRaw);
        lastSetValueRef.current = transliterated;
        if (onChange) onChange({ target: { name, value: transliterated } });
        return;
      }
    }

    handleFormNavigation(e);
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
          disabled={disabled}
          className={`w-full ${Icon && !isTextarea ? 'pl-10' : 'px-4'} py-2.5 bg-gray-50 border rounded-xl text-sm outline-none transition ${isTextarea ? 'resize-none' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            ${error
              ? 'border-red-200 focus:ring-2 focus:ring-red-500 bg-red-50/30'
              : 'border-gray-100 focus:ring-2 focus:ring-blue-500'
            }
            ${shouldTransliterate ? 'ring-1 ring-orange-200' : ''}`}
        />
        {shouldTransliterate && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-orange-400 pointer-events-none">ગુજ</span>
        )}
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
