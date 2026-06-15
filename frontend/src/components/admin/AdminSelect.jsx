import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import '../../styles/admin.css';

const AdminSelect = ({ value, onChange, options, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleSelect = (optValue) => {
    onChange({ target: { name, value: optValue } });
    setIsOpen(false);
  };

  return (
    <div className="admin-custom-select-container" ref={containerRef}>
      <div 
        className={`admin-custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption.label}</span>
        <IconChevronDown size={16} className={`acs-icon ${isOpen ? 'open' : ''}`} />
      </div>

      {isOpen && (
        <div className="admin-custom-select-dropdown glass-panel">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`acs-option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSelect;
