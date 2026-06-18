import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

const CustomSelect = ({ value, onChange, options, placeholder, style, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div 
      className={`cs-dropdown-container ${disabled ? 'disabled' : ''}`} 
      ref={dropdownRef} 
      style={{ position: 'relative', width: '100%', ...style }}
    >
      <div 
        className={`cs-dropdown-trigger ${isOpen ? 'open' : ''} ${!value ? 'placeholder' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          height: style?.height || '42px',
          background: disabled ? '#f3f4f6' : '#ffffff',
          border: `1px solid ${isOpen ? '#3b82f6' : '#e5e7eb'}`,
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          color: disabled ? '#9ca3af' : (!value ? '#9ca3af' : '#111827'),
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
          opacity: disabled ? 0.7 : 1
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <IconChevronDown 
          size={16} 
          style={{ 
            color: '#9ca3af', 
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </div>
      
      {isOpen && !disabled && (
        <div 
          className="cs-dropdown-menu fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'rgba(245, 247, 250, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.10)',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 100,
            padding: '6px'
          }}
        >
          {options.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>
              No options available
            </div>
          ) : (
            options.map((opt, idx) => {
              const isSelected = value === opt.value;
              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: isSelected ? '#1d4ed8' : '#374151',
                    background: isSelected ? '#eff6ff' : 'transparent',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.15s ease',
                    marginBottom: idx === options.length - 1 ? 0 : '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {opt.label}
                  {isSelected && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8' }}></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      <style>{`.cs-dropdown-menu { scrollbar-width: none; -ms-overflow-style: none; }
.cs-dropdown-menu::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default CustomSelect;
