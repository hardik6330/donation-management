import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const SearchableDropdown = ({
  label,
  name,
  value,
  placeholder,
  items = [],
  onChange,
  onSelect,
  isActive,
  setActive,
  disabled = false,
  required = false,
  icon: Icon,
  inputRef,
  onKeyDown
}) => {
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const listRef = useRef(null);

  const filtered = items.filter(item =>
    item.name?.toLowerCase().includes((value || '').toLowerCase())
  );

  // Reset highlight when list changes or dropdown opens/closes
  useEffect(() => {
    setHighlightIndex(-1);
  }, [isActive, value]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && highlightIndex >= 0) {
      const el = listRef.current.children[highlightIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
  };

  const handleKeyDownInternal = (e) => {
    if (isActive && filtered.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
        return;
      }
      if (e.key === 'Enter' && highlightIndex >= 0) {
        e.preventDefault();
        const item = filtered[highlightIndex];
        onSelect(item.id, item.name);
        setActive(null);
        setHighlightIndex(-1);
        return;
      }
      if (e.key === 'Escape') {
        setActive(null);
        setHighlightIndex(-1);
        return;
      }
    }
    // Forward to parent handler (fast entry)
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div className="space-y-1.5 relative" onClick={(e) => e.stopPropagation()}>
      {label && (
        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
          {Icon && <Icon className="w-3 h-3" />} {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setActive(name)}
          onKeyDown={handleKeyDownInternal}
          disabled={disabled}
          autoComplete="off"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50 pr-8"
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {isActive && filtered.length > 0 && (
          <div ref={listRef} className="absolute z-[120] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
            {filtered.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item.id, item.name);
                  setActive(null);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                  index === highlightIndex ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableDropdown;
