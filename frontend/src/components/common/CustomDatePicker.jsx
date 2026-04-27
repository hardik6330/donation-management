import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { handleFormNavigation } from '../../utils/formNavigation';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CustomDatePicker = ({ 
  value, 
  onChange, 
  name, 
  placeholder = 'Select date', 
  label, 
  required = false, 
  icon: Icon, 
  disabled = false,
  onKeyDown,
  inputRef,
  minDate
}) => {
  const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : null;
  const isBeforeMin = (y, m, d) => {
    if (!minDateObj) return false;
    const candidate = new Date(y, m, d);
    candidate.setHours(0, 0, 0, 0);
    const min = new Date(minDateObj);
    min.setHours(0, 0, 0, 0);
    return candidate < min;
  };
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + 'T00:00:00');
    return new Date();
  });
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const internalRef = useRef(null);
  const triggerRef = inputRef || internalRef;

  useEffect(() => {
    if (value) setViewDate(new Date(value + 'T00:00:00'));
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

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const calendarHeight = 360;
      setDropdownPos({
        top: spaceBelow < calendarHeight ? rect.top - calendarHeight : rect.bottom + 4,
        left: rect.left
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = [];
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, current: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, current: true });
  }
  // Next month leading days
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, current: false });
  }

  const selectedHighlightDate = viewDate;
  const today = new Date();

  const isSelected = (day) => {
    if (!day.current) return false;
    // Use viewDate for arrow key highlighting
    return selectedHighlightDate.getFullYear() === year && selectedHighlightDate.getMonth() === month && selectedHighlightDate.getDate() === day.day;
  };

  const isToday = (day) => {
    if (!day.current) return false;
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day.day;
  };

  const handleSelect = (day) => {
    if (!day.current) return;
    if (isBeforeMin(year, month, day.day)) return;
    const selected = `${year}-${String(month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
    onChange({ target: { name, value: selected } });
    setIsOpen(false);
    // After selection, trigger onKeyDown to move to next field
    if (onKeyDown) {
      onKeyDown({ key: 'Enter', preventDefault: () => {} });
    }
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const formatDisplay = (val) => {
    if (!val) return '';
    const d = new Date(val + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleKeyDownInternal = (e) => {
    if (e.key === 'Enter') {
      if (!isOpen) {
        setIsOpen(true);
        e.preventDefault();
      } else {
        // If open, select current viewDate
        if (isBeforeMin(year, month, viewDate.getDate())) {
          e.preventDefault();
          return;
        }
        const selected = `${year}-${String(month + 1).padStart(2, '0')}-${String(viewDate.getDate()).padStart(2, '0')}`;
        onChange({ target: { name, value: selected } });
        setIsOpen(false);
        e.preventDefault();

        // Hand off to parent onKeyDown (which advances focus to next field)
        if (onKeyDown) {
          setTimeout(() => onKeyDown({ key: 'Enter', preventDefault: () => {} }), 0);
        } else {
          setTimeout(() => handleFormNavigation({ ...e, key: 'Enter', target: triggerRef.current }), 0);
        }
      }
    } else if (isOpen) {
      if (e.key === 'ArrowRight') {
        setViewDate(new Date(year, month, viewDate.getDate() + 1));
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        setViewDate(new Date(year, month, viewDate.getDate() - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        setViewDate(new Date(year, month, viewDate.getDate() + 7));
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setViewDate(new Date(year, month, viewDate.getDate() - 7));
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        e.preventDefault();
      }
    } else {
      if (onKeyDown) {
        onKeyDown(e);
      }
      handleFormNavigation(e);
    }
  };

  return (
    <div className="relative space-y-1.5" ref={ref}>
      {label && (
        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
          {Icon && <Icon className="w-3 h-3" />} {label} {required && '*'}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        onKeyDown={handleKeyDownInternal}
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
        }}
        className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm cursor-pointer flex items-center justify-between transition ${isOpen ? 'ring-2 ring-blue-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      </button>

      {isOpen && (
        <div
          className="fixed z-[200] bg-white border border-gray-100 rounded-2xl shadow-xl p-3 w-[280px] animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-bold text-gray-800">{MONTHS[month]} {year}</span>
            <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(day)}
                disabled={!day.current || isBeforeMin(year, month, day.day)}
                className={`w-9 h-9 flex items-center justify-center text-xs font-medium rounded-lg transition-all
                  ${!day.current || isBeforeMin(year, month, day.day)
                    ? 'text-gray-300 cursor-not-allowed line-through'
                    : `cursor-pointer hover:bg-blue-50 hover:text-blue-600
                       ${isSelected(day) ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white font-bold' : ''}
                       ${isToday(day) && !isSelected(day) ? 'bg-blue-50 text-blue-600 font-bold ring-1 ring-blue-200' : ''}
                       ${!isSelected(day) && !isToday(day) ? 'text-gray-700' : ''}`}
                `}
              >
                {day.day}
              </button>
            ))}
          </div>

          {/* Today button */}
          <div className="mt-2 pt-2 border-t border-gray-50">
            <button
              type="button"
              onClick={() => {
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                onChange({ target: { name, value: todayStr } });
                setViewDate(new Date());
                setIsOpen(false);
              }}
              className="w-full text-center text-xs font-bold text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
