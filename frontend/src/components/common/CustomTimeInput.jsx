import React, { useState, useRef, useEffect } from 'react';
import { IconClock } from '@tabler/icons-react';

const CustomTimeInput = ({ value, onChange, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse current value (e.g. "17:00")
  const [hh, mm] = (value || '09:00').split(':');
  
  const [hour, setHour] = useState(hh || '09');
  const [minute, setMinute] = useState(mm || '00');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHour(h);
      setMinute(m);
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

  const handleApply = (newH, newM) => {
    onChange(`${newH}:${newM}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
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
        <span>{value || 'Select Time'}</span>
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
            width: '200px',
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
            <div style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid rgba(0,0,0,0.05)' }} className="time-scroll-col">
              {hours.map(h => (
                <div 
                  key={`h-${h}`}
                  onClick={() => { setHour(h); handleApply(h, minute); }}
                  style={{
                    padding: '8px 0',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: hour === h ? 600 : 400,
                    background: hour === h ? '#eff6ff' : 'transparent',
                    color: hour === h ? '#1d4ed8' : '#374151',
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            
            {/* Minutes Column */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="time-scroll-col">
              {minutes.map(m => (
                <div 
                  key={`m-${m}`}
                  onClick={() => { setMinute(m); handleApply(hour, m); setIsOpen(false); }}
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
          </div>
          
          <div style={{ padding: '8px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>HH : MM</span>
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
