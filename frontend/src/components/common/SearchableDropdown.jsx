import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';
import { handleFormNavigation } from '../../utils/formNavigation';

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
  showClear = true,
  icon: Icon,
  inputRef,
  onKeyDown,
  onLoadMore,
  hasMore = false,
  loading = false,
  isServerSearch = false
}) => {
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const listRef = useRef(null);
  const inputContainerRef = useRef(null);

  const filtered = isServerSearch 
    ? items 
    : items.filter(item =>
        item.name?.toLowerCase().includes((value || '').toLowerCase())
      );

  // Update position coordinates whenever dropdown is opened or window changes
  useEffect(() => {
    if (isActive && inputContainerRef.current) {
      const updateCoords = () => {
        const rect = inputContainerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      };

      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
      return () => {
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', updateCoords, true);
      };
    }
  }, [isActive]);

  const handleScroll = (e) => {
    if (!onLoadMore || !hasMore || loading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Check if user is near the bottom (within 20px)
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      onLoadMore();
    }
  };

  // Reset highlight when list changes or dropdown opens/closes
  const handleInputChange = (e) => {
    setHighlightIndex(-1);
    onChange(e);
  };

  const handleInputFocus = () => {
    setHighlightIndex(-1);
    setActive(name);
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && highlightIndex >= 0) {
      const el = listRef.current.children[highlightIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  const handleClear = (e) => {
    e.stopPropagation();
    setHighlightIndex(-1);
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

    // Use common navigation logic
    let handled = false;
    if (onKeyDown) {
      onKeyDown(e);
      if (e.defaultPrevented) handled = true;
    }

    if (!handled) {
      handleFormNavigation(e);
    }
  };

  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;
    const handleMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        // Only close if not clicking inside the portal list
        if (listRef.current && listRef.current.contains(e.target)) return;
        setActive(null);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isActive, setActive]);

  return (
    <div ref={containerRef} className="space-y-1.5 relative" onClick={(e) => e.stopPropagation()}>
      {label && (
        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
          {Icon && <Icon className="w-3 h-3" />} {label} {required && '*'}
        </label>
      )}
      <div className="relative" ref={inputContainerRef}>
        <input
          ref={inputRef}
          type="text"
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDownInternal}
          disabled={disabled}
          autoComplete="off"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50 pr-8"
        />
        {!disabled && (showClear ? (
          value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )
        ) : (
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none transition-transform ${isActive ? 'rotate-180' : ''}`} />
        ))}

        {isActive && filtered.length > 0 && coords.width > 0 && createPortal(
          <div 
            ref={listRef} 
            onScroll={handleScroll}
            style={{ 
              position: 'absolute', 
              top: `${coords.top}px`, 
              left: `${coords.left}px`, 
              width: `${coords.width}px`,
              zIndex: 9999 
            }}
            className="mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
          >
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
            {loading && (
              <div className="p-3 text-center">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default SearchableDropdown;
