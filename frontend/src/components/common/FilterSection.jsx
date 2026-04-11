import React, { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import CustomMonthPicker from './CustomMonthPicker';

const FilterDropdown = ({ field, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const listRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedLabel = field.options.find(opt => opt.value === value)?.label || '';

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [isOpen]);

  // Handle server-side search
  useEffect(() => {
    if (field.onSearchChange) {
      field.onSearchChange(search);
    }
  }, [search, field.onSearchChange]);

  // "All" option + filtered options combined for keyboard nav
  const allItems = field.isServerSearch 
    ? field.options 
    : field.options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      );

  const handleScroll = (e) => {
    if (!field.onLoadMore || !field.hasMore || field.loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Check if user is near the bottom (within 40px)
    if (scrollHeight - scrollTop <= clientHeight + 40) {
      field.onLoadMore();
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    setSearch('');
    setHighlightIndex(-1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setHighlightIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

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
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightIndex >= 0) {
        e.preventDefault();
        handleSelect(allItems[highlightIndex].value);
      } else if (!isOpen) {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <div
        className={`w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm flex items-center justify-between transition ${isOpen ? 'ring-2 ring-blue-500 bg-white' : ''} ${field.disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={triggerRef}
          type="text"
          autoComplete="off"
          placeholder={selectedLabel || field.placeholder || `All ${field.label}`}
          value={isOpen ? search : (selectedLabel || '')}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          className="bg-transparent border-none outline-none w-full text-inherit placeholder:text-gray-800 focus:placeholder:text-gray-400 cursor-text"
        />
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
          <ChevronDown 
            className={`w-4 h-4 transition-transform cursor-pointer ${isOpen ? 'rotate-180' : ''}`} 
            onClick={toggleDropdown}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[120] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div ref={listRef} onScroll={handleScroll} className="max-h-56 overflow-y-auto custom-scrollbar py-2">
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
            {field.loading && (
              <div className="p-3 text-center">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}
            {allItems.length === 0 && !field.loading && (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FilterSection = ({ filters = {}, onFilterChange, onClearFilters, fields = [] }) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const hasActiveFilters = fields.some(f => filters && filters[f.name] && filters[f.name] !== '');

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
                    value={filters?.[field.name]}
                    onChange={onFilterChange}
                  />
                ) : field.type === 'date' ? (
                  <CustomDatePicker
                    name={field.name}
                    value={filters?.[field.name]}
                    onChange={onFilterChange}
                    placeholder={field.placeholder || 'Select date'}
                  />
                ) : field.type === 'month' ? (
                  <CustomMonthPicker
                    name={field.name}
                    value={filters?.[field.name]}
                    onChange={onFilterChange}
                    placeholder={field.placeholder || 'Select month'}
                  />
                ) : (
                  <>
                    <input
                      type={field.type || 'text'}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={filters?.[field.name] || ''}
                      onChange={(e) => onFilterChange(e)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    {filters?.[field.name] && (
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
