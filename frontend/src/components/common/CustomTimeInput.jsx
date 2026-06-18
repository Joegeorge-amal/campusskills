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

const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

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

  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const sel = scrollRef.current.querySelector('.cs-time-selected');
      if (sel) sel.scrollIntoView({ block: 'center' });
    }
  }, [isOpen]);

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
            bottom: 'calc(100% + 6px)',
            left: 0,
            width: '200px',
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
          <div ref={scrollRef} style={{ display: 'flex', height: '200px' }}>
            {/* Hours Column */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="time-scroll-col">
              {hours12.map(h => {
                const sel = hour12 === h;
                return (
                  <div 
                    key={`h-${h}`}
                    className={sel ? 'cs-time-selected' : ''}
                    onClick={() => { setHour12(h); handleApply(h, minute, ampm); }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)'; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                    style={{
                      padding: '8px 0',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderRadius: '8px',
                      fontWeight: sel ? 600 : 400,
                      background: sel ? '#eff6ff' : 'transparent',
                      color: sel ? '#1d4ed8' : '#374151',
                      transition: 'all 0.15s ease',
                      marginBottom: '2px',
                      position: 'relative'
                    }}
                  >
                    {h}
                    {sel && (
                      <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8' }}></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Separator */}
            <div style={{ width: '1px', background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />

            {/* Minutes Column */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="time-scroll-col">
              {minutes.map(m => {
                const sel = minute === m;
                return (
                  <div 
                    key={`m-${m}`}
                    className={sel ? 'cs-time-selected' : ''}
                    onClick={() => { setMinute(m); handleApply(hour12, m, ampm); }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)'; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                    style={{
                      padding: '8px 0',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderRadius: '8px',
                      fontWeight: sel ? 600 : 400,
                      background: sel ? '#eff6ff' : 'transparent',
                      color: sel ? '#1d4ed8' : '#374151',
                      transition: 'all 0.15s ease',
                      marginBottom: '2px',
                      position: 'relative'
                    }}
                  >
                    {m}
                    {sel && (
                      <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8' }}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AM/PM Toggle */}
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

      <style>{`
        .time-scroll-col::-webkit-scrollbar { width: 4px; }
        .time-scroll-col::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default CustomTimeInput;