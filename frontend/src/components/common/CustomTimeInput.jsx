import React, { useState, useRef, useEffect } from 'react';
import { IconClock } from '@tabler/icons-react';

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

const CustomTimeInput = ({ value, onChange, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const parsed = to12((value || '09:00').split(':')[0]);
  const [hour12, setHour12] = useState(parsed.h12);
  const [ampm, setAmPm] = useState(parsed.ampm);
  const [minute, setMinute] = useState((value || '09:00').split(':')[1] || '00');

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

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

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
        <IconClock 
          size={16} 
          style={{ 
            color: isOpen ? '#3b82f6' : '#9ca3af', 
            transition: 'color 0.2s ease',
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
            width: '260px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', height: '200px' }}>
            {/* Hours Column */}
            <div style={{ flex: '0 0 70px', overflowY: 'auto', borderRight: '1px solid rgba(0,0,0,0.05)' }} className="time-scroll-col">
              {hours.map(h => (
                <div 
                  key={`h-${h}`}
                  onClick={() => { setHour12(h); handleApply(h, minute, ampm); }}
                  style={{
                    padding: '8px 0',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: hour12 === h ? 600 : 400,
                    background: hour12 === h ? '#eff6ff' : 'transparent',
                    color: hour12 === h ? '#1d4ed8' : '#374151',
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            
            {/* Minutes Column */}
            <div style={{ flex: '0 0 70px', overflowY: 'auto', borderRight: '1px solid rgba(0,0,0,0.05)' }} className="time-scroll-col">
              {minutes.map(m => (
                <div 
                  key={`m-${m}`}
                  onClick={() => { setMinute(m); handleApply(hour12, m, ampm); }}
                  style={{
                    padding: '8px 0',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: minute === m ? 600 : 400,
                    background: minute === m ? '#eff6ff' : 'transparent',
                    color: minute === m ? '#1d4ed8' : '#374151',
                  }}
                >
                  {m}
                </div>
              ))}
            </div>

            {/* AM/PM Column */}
            <div style={{ flex: '0 0 60px', overflowY: 'auto' }} className="time-scroll-col">
              {['AM', 'PM'].map(ap => (
                <div 
                  key={ap}
                  onClick={() => { setAmPm(ap); handleApply(hour12, minute, ap); }}
                  style={{
                    padding: '8px 0',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: ampm === ap ? 600 : 400,
                    background: ampm === ap ? '#eff6ff' : 'transparent',
                    color: ampm === ap ? '#1d4ed8' : '#374151',
                  }}
                >
                  {ap}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ padding: '8px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>HH : MM AM/PM</span>
          </div>
        </div>
      )}
      <style>{`
        .time-scroll-col::-webkit-scrollbar {
          width: 4px;
        }
        .time-scroll-col::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default CustomTimeInput;
