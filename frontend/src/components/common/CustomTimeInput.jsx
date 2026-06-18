import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

const to12 = (h24) => {
  const n = parseInt(h24, 10);
  if (n === 0) return { h12: 12, ampm: 'AM' };
  if (n < 12) return { h12: n, ampm: 'AM' };
  if (n === 12) return { h12: 12, ampm: 'PM' };
  return { h12: n - 12, ampm: 'PM' };
};

const to24 = (h12, ampm) => {
  if (ampm === 'AM') return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
};

const formatDisplay = (val) => {
  if (!val) return 'Select Time';
  const [h, m] = val.split(':');
  const { h12, ampm } = to12(h);
  return `${h12}:${m} ${ampm}`;
};

const generateTimes = () => {
  const times = [];
  for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m += 5) {
      times.push({ h12: h, minute: String(m).padStart(2, '0') });
    }
  }
  return times;
};

const timeOptions = generateTimes();

const CustomTimeInput = ({ value, onChange, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const parsed = to12((value || '12:00').split(':')[0]);
  const [hour12, setHour12] = useState(parsed.h12);
  const [ampm, setAmPm] = useState(parsed.ampm);
  const [minute, setMinute] = useState((value || '12:00').split(':')[1] || '00');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      const { h12, ampm: ap } = to12(h);
      setHour12(h12);
      setMinute(m);
      setAmPm(ap);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = (h12, m, ap) => {
    const h24 = String(to24(h12, ap)).padStart(2, '0');
    onChange(`${h24}:${m}`);
  };

  const toggleAmPm = () => {
    const next = ampm === 'AM' ? 'PM' : 'AM';
    setAmPm(next);
    handleApply(hour12, minute, next);
  };

  const isSelected = (h, m) => hour12 === h && minute === m;

  return (
    <div 
      className="cs-time-input-container" 
      ref={dropdownRef}
      style={{ position: 'relative', width: '100%', height: style?.height || '42px', ...style }}
    >
      <div 
        className={`cs-dropdown-trigger ${isOpen ? 'open' : ''} ${!value ? 'placeholder' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          height: '100%',
          background: '#ffffff',
          border: `1px solid ${isOpen ? '#3b82f6' : '#e5e7eb'}`,
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          color: !value ? '#9ca3af' : '#111827',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
        }}
      >
        <span>{formatDisplay(value)}</span>
        <IconChevronDown 
          size={16} 
          style={{ 
            color: '#9ca3af', 
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }} 
        />
      </div>

      {isOpen && (
        <div 
          className="cs-dropdown-menu fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
            zIndex: 100,
            padding: '6px'
          }}
        >
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {timeOptions.map((opt, idx) => {
              const sel = isSelected(opt.h12, opt.minute);
              return (
                <div 
                  key={idx}
                  onClick={() => { setHour12(opt.h12); setMinute(opt.minute); handleApply(opt.h12, opt.minute, ampm); }}
                  onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)'; }}
                  onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: sel ? '#1d4ed8' : '#374151',
                    background: sel ? '#eff6ff' : 'transparent',
                    fontWeight: sel ? 600 : 400,
                    transition: 'all 0.15s ease',
                    marginBottom: idx === timeOptions.length - 1 ? 0 : '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{opt.h12}:{opt.minute}</span>
                  {sel && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8' }}></div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '6px', padding: '6px 0 2px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            {['AM', 'PM'].map(ap => (
              <div
                key={ap}
                onClick={toggleAmPm}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  textAlign: 'center',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: ampm === ap ? '#1d4ed8' : '#f3f4f6',
                  color: ampm === ap ? '#ffffff' : '#6b7280',
                  transition: 'all 0.15s ease',
                  userSelect: 'none'
                }}
              >
                {ap}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimeInput;