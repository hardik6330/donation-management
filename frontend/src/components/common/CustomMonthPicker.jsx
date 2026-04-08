import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CustomMonthPicker = ({ value, onChange, name, placeholder = 'Select month', disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value) return parseInt(value.split('-')[0]);
    return new Date().getFullYear();
  });
  const ref = useRef(null);

  useEffect(() => {
    if (value) setViewYear(parseInt(value.split('-')[0]));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedMonth = value ? parseInt(value.split('-')[1]) - 1 : null;
  const selectedYear = value ? parseInt(value.split('-')[0]) : null;
  const today = new Date();

  const handleSelect = (monthIndex) => {
    const val = `${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  const formatDisplay = (val) => {
    if (!val) return '';
    const [y, m] = val.split('-');
    return `${FULL_MONTHS[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm cursor-pointer flex items-center justify-between transition ${isOpen ? 'ring-2 ring-blue-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className={value ? 'text-gray-800' : 'text-gray-400'}>
            {formatDisplay(value) || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange({ target: { name, value: '' } });
              }}
              className="hover:text-red-500 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[130] mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 w-[260px] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setViewYear(viewYear - 1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-bold text-gray-800">{viewYear}</span>
            <button type="button" onClick={() => setViewYear(viewYear + 1)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Months grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS.map((m, i) => {
              const isSelected = selectedYear === viewYear && selectedMonth === i;
              const isCurrent = today.getFullYear() === viewYear && today.getMonth() === i;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelect(i)}
                  className={`py-2.5 rounded-lg text-xs font-semibold transition-all
                    ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    ${isCurrent && !isSelected ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : ''}
                    ${!isSelected && !isCurrent ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600' : ''}
                  `}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMonthPicker;
