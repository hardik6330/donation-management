import React, { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import CustomMonthPicker from './CustomMonthPicker';

const FilterDropdown = ({ field, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedLabel = field.options.find(opt => opt.value === value)?.label || '';

  // Close on click outside
  useEffect(() => {
    const handleClick = () => setIsOpen(false);
    if (isOpen) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [isOpen]);

  // "All" option + filtered options combined for keyboard nav
  const filtered = field.options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );
  const allItems = [{ value: '', label: field.placeholder || `All ${field.label}` }, ...filtered];

  // Reset highlight when dropdown opens/search changes
  useEffect(() => {
    setHighlightIndex(-1);
  }, [isOpen, search]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && highlightIndex >= 0) {
      const el = listRef.current.children[highlightIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const handleSelect = (optValue) => {
    onChange({ target: { name: field.name, value: optValue } });
    setIsOpen(false);
    setSearch('');
    setHighlightIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name: field.name, value: '' } });
    setSearch('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0) {
        handleSelect(allItems[highlightIndex].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightIndex(-1);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <div
        ref={triggerRef}
        tabIndex={0}
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        onKeyDown={handleKeyDown}
        className={`w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm cursor-pointer flex items-center justify-between transition ${isOpen ? 'ring-2 ring-blue-500' : ''} ${field.disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <span className={selectedLabel ? 'text-gray-800' : 'text-gray-400'}>
          {selectedLabel || field.placeholder || `All ${field.label}`}
        </span>
        <div className="flex items-center gap-1 text-gray-400">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-red-500 transition-colors p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[120] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {field.options.length > 5 && (
            <div className="p-2 border-b border-gray-50">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
          <div ref={listRef} className="max-h-48 overflow-y-auto custom-scrollbar">
            {allItems.map((item, index) => (
              <button
                key={item.value || '__all__'}
                type="button"
                onClick={() => handleSelect(item.value)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0
                  ${index === highlightIndex ? 'bg-blue-50 text-blue-600' : ''}
                  ${index !== highlightIndex && value === item.value ? 'bg-blue-50/50 text-blue-600' : ''}
                  ${index !== highlightIndex && value !== item.value && item.value === '' ? 'text-gray-500 hover:bg-gray-50' : ''}
                  ${index !== highlightIndex && value !== item.value && item.value !== '' ? 'text-gray-700 hover:bg-blue-50' : ''}
                `}
              >
                {item.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FilterSection = ({ filters, onFilterChange, onClearFilters, fields }) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const hasActiveFilters = fields.some(f => filters[f.name] && filters[f.name] !== '');

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="flex sm:hidden items-center justify-between w-full py-1 text-xs font-bold text-gray-500 uppercase tracking-wider"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMobileFilters ? 'rotate-180' : ''}`} />
      </button>

      <div className="hidden sm:flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className={`text-xs font-bold uppercase tracking-wider transition ${hasActiveFilters ? 'text-blue-600 hover:underline cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
        >
          Clear All
        </button>
      </div>

      <div className={`${showMobileFilters ? 'block' : 'hidden'} sm:block mt-4 sm:mt-0`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6 items-end">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                {field.icon && <field.icon className="w-3 h-3" />} {field.label}
              </label>
              <div className="relative group">
                {field.type === 'select' ? (
                  <FilterDropdown
                    field={field}
                    value={filters[field.name]}
                    onChange={onFilterChange}
                  />
                ) : field.type === 'date' ? (
                  <CustomDatePicker
                    name={field.name}
                    value={filters[field.name]}
                    onChange={onFilterChange}
                    placeholder={field.placeholder || 'Select date'}
                  />
                ) : field.type === 'month' ? (
                  <CustomMonthPicker
                    name={field.name}
                    value={filters[field.name]}
                    onChange={onFilterChange}
                    placeholder={field.placeholder || 'Select month'}
                  />
                ) : (
                  <>
                    <input
                      type={field.type || 'text'}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={filters[field.name]}
                      onChange={(e) => onFilterChange(e)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    {filters[field.name] && (
                      <button
                        onClick={() => onFilterChange({ target: { name: field.name, value: '' } })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
